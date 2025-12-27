Ось оновлена інструкція з налаштування сервера з урахуванням усіх зауважень.

---

# Інструкція з налаштування сервера "з нуля" (IP-based Canary Deployment)

Ця інструкція містить рекомендації щодо безпеки, сумісності та автоматизації, а також модифікацію **canary deployment** на основі IP-адрес. Використовуємо "blue-green" підхід: стабільна версія (blue) на порту 3001, тестова (green) на порту 3002.

## Передумови:
- Свіжий сервер Debian 12+ з SSH-доступом як root або sudo-користувач.
- Домен (наприклад, vash-domen.com) спрямований на IP сервера.
- Приватний Git-репозиторій (в іншому випадку пропустіть налаштування ключів).
- Змінні: Замініть `vash-domen.com`, `<URL_ВАШОГО_РЕПОЗИТОРІЯ>`, `3001` та `3002` у команді на ваші дані.
- Вкажіть IP у конфігурації Apache для canary.

## **Етапи налаштування**

### Етап 0: Базова безпека SSH
1. **Оновлення системи:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Встановлення fail2ban:**
   ```bash
   sudo apt install -y fail2ban
   ```

3. **Налаштування SSH:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   - Додайте/змініть:
     ```
     PermitRootLogin no
     PasswordAuthentication no  # Після налаштування ключів
     ```

4. **Перезапуск SSH:**
   ```bash
   sudo systemctl restart ssh
   ```

5. **Генерація SSH-ключів (на вашому ПК):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

6. **Копіювання ключа на сервер:**
   ```bash
   ssh-copy-id your-admin-user@server-ip
   ```

### Етап 1: Підготовка системи
1. **Встановлення базових пакетів:**
   ```bash
   sudo apt install -y curl git build-essential apache2 certbot python3-certbot-apache ufw apparmor fail2ban libapache2-mod-proxy-html
   ```

2. **Активування модулів Apache:**
   ```bash
   sudo a2enmod proxy proxy_http rewrite headers
   ```

3. **Встановлення Node.js v22 LTS:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

### Етап 2: Налаштування безпеки та користувачів
1. **Створення deploy-user:**
   ```bash
   sudo adduser deploy-user
   sudo usermod -aG www-data deploy-user
   ```

2. **Створення папок проекту:**
   ```bash
   sudo mkdir -p /var/www/movie-app-blue /var/www/movie-app-green
   sudo chown -R deploy-user:www-data /var/www/movie-app-blue /var/www/movie-app-green
   sudo chmod -R 755 /var/www/movie-app-blue /var/www/movie-app-green
   sudo find /var/www/movie-app-blue /var/www/movie-app-green -type f -exec chmod 644 {} +
   ```

3. **Налаштування firewall:**
   ```bash
   sudo ufw allow 'Apache Full'
   sudo ufw limit ssh
   sudo ufw --force enable
   ```

### Етап 3: Налаштування Apache та SSL
1. **Конфігурація Apache:**
   ```bash
   sudo nano /etc/apache2/sites-available/movie-app.conf
   ```

2. **Вставте наступний конфіг:**
   ```apache
   <VirtualHost *:80>
       ServerName vash-domen.com
       ServerAlias www.vash-domen.com

       ProxyRequests Off
       ProxyPreserveHost On

       RewriteEngine On

       # Canary для певних IP
       RewriteCond %{REMOTE_ADDR} =192.168.1.1 [OR]
       RewriteCond %{REMOTE_ADDR} =10.0.0.2
       RewriteRule ^/(.*)$ http://localhost:3002/$1 [P,L]

       # Default для всіх інших
       ProxyPass / http://localhost:3001/
       ProxyPassReverse / http://localhost:3001/

       <Proxy *>
           Require all granted
       </Proxy>

       ErrorLog ${APACHE_LOG_DIR}/movie-app-error.log
       CustomLog ${APACHE_LOG_DIR}/movie-app-access.log combined
   </VirtualHost>
   ```

3. **Активуйте сайт та SSL:**
   ```bash
   sudo apache2ctl configtest
   sudo a2ensite movie-app.conf
   sudo a2dissite 000-default.conf
   sudo systemctl restart apache2

   sudo certbot --apache -d vash-domen.com -d www.vash-domen.com

   sudo crontab -e
   ```
   Додайте в crontab для автоматичного поновлення:
   ```cron
   0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload apache2
   ```

### Етап 4: Розгортання додатку
1. **Перемикання на deploy-user:**
   ```bash
   sudo su - deploy-user
   ```

2. **Налаштування nvm:**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.nvm/nvm.sh
   nvm install 22
   nvm use 22
   ```

3. **Розгортання в blue:**
   ```bash
   cd /var/www/movie-app-blue
   git clone <URL_ВАШОГО_РЕПОЗИТОРІЯ> .
   nano .env
   chmod 600 .env
   npm install
   npm run build
   npm install -g pm2
   pm2 start server.js --name movie-app-blue
   pm2 save
   ```

4. **Опціонально: копіювання blue в green:**
   ```bash
   cp -r /var/www/movie-app-blue/* /var/www/movie-app-green/
   ```

### Етап 5: Автоматизація оновлень (deploy.sh)
1. **Створення скрипта:**
   ```bash
   nano ~/deploy.sh
   ```

2. **Додати код скрипта:**
   ```bash
   #!/bin/bash
   set -e
   BLUE_PATH="/var/www/movie-app-blue"
   GREEN_PATH="/var/www/movie-app-green"
   LOG_FILE="$HOME/deploy.log"
   CANARY=false
   PROMOTE=false

   while [[ $# -gt 0 ]]; do
       case $1 in
           --canary) CANARY=true; shift ;;
           --promote) PROMOTE=true; shift ;;
           *) echo "Невідомий аргумент: $1" >> "$LOG_FILE"; exit 1 ;;
       esac
   done

   if [ "$PROMOTE" = true ]; then
       echo "--- 📈 Промоушен green до blue ---" | tee -a "$LOG_FILE"
       rm -rf "$BLUE_PATH"/*
       cp -r "$GREEN_PATH"/* "$BLUE_PATH"/
       cd "$BLUE_PATH" || exit 1
       npm install | tee -a "$LOG_FILE"
       npm run build || echo "Build не обов'язковий" >> "$LOG_FILE"
       pm2 restart movie-app-blue
       echo "✅ Промоушен завершено!" | tee -a "$LOG_FILE"
       exit 0
   fi

   PROJECT_PATH="$CANARY" ? "$GREEN_PATH" : "$BLUE_PATH"
   APP_NAME="movie-app-${CANARY:-blue}"
   echo "--- 🔄 Стандартний деплой в ${CANARY:-blue} ---" | tee -a "$LOG_FILE"
   cd "$PROJECT_PATH" || { echo "Помилка: Не вдалося перейти в $PROJECT_PATH" >> "$LOG_FILE"; exit 1; }
   git pull origin main || { echo "Помилка git pull" >> "$LOG_FILE"; exit 1; }
   npm install | tee -a "$LOG_FILE"
   npm run build || echo "Build не обов'язковий, продовжуємо" >> "$LOG_FILE"
   pm2 restart $APP_NAME || pm2 start server.js --name $APP_NAME
   pm2 save
   echo "✅ Проект оновлено!" | tee -a "$LOG_FILE"
   ```

3. **Надати дозволи:**
   ```bash
   chmod +x ~/deploy.sh
   ```

### Етап 6: Моніторинг, бекапи та тестування
- **Логротейшн:** Встановлюється logrotate.
- **Бекапи:** Налаштуйте cron для щотижневих бекапів.
  ```bash
  sudo crontab -e
  ```
  Додайте:
  ```cron
  0 2 * * 0 rsync -a /var/www/movie-app-blue /backup/movie-app-blue-$(date +\%Y-\%m-\%d)
  0 2 * * 0 rsync -a /var/www/movie-app-green /backup/movie-app-green-$(date +\%Y-\%m-\%d)
  ```

### **Як працювати з сервером:**
1. **Стандартний деплой:**
   ```bash
   ./deploy.sh
   ```

2. **Canary деплой:**
   ```bash
   ./deploy.sh --canary
   ```

3. **Процес моніторингу та тестування:**
   ```bash
   curl http://localhost:3001  # Blue
   curl http://localhost:3002  # Green
   curl https://vash-domen.com  # Зовні
   ```

4. **Обслуговування системи:**
   - Оновлення системи:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Безпека:**
   - Регулярно перевіряйте логи:
   ```bash
   sudo journalctl -u apache2
   ```

---

**Ця інструкція була адаптована для зручності, безпеки та ефективності облaштування сервера.**