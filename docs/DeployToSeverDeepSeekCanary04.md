# ОНОВЛЕНА Інструкція: Налаштування сервера з IP-based Canary Deployment


## 🔐 Етап 0: Базова безпека SSH
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y fail2ban
sudo nano /etc/ssh/sshd_config
```
```ini
PermitRootLogin no
PasswordAuthentication no
AllowUsers ваш-користувач@ваш-IP
```
```bash
sudo systemctl restart ssh
```

---

## 🛠️ Етап 1: Підготовка системи
```bash
# Встановлення пакетів
sudo apt install -y curl git build-essential apache2 certbot \
python3-certbot-apache ufw apparmor libapache2-mod-proxy-html

# Активуємо модулі Apache
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2

# Встановлення Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 👤 Етап 2: Користувачі та права
```bash
# Створення користувача
sudo adduser deploy-user
sudo usermod -aG www-data deploy-user

# Папки проекту
sudo mkdir -p /var/www/movie-app-{blue,green}
sudo chown -R deploy-user:www-data /var/www/movie-app-*
sudo chmod 755 /var/www/movie-app-*

# Захист .env файлів
sudo su - deploy-user
echo ".env" | tee -a /var/www/movie-app-{blue,green}/.gitignore
exit

# Firewall
sudo ufw allow 'Apache Full'
sudo ufw limit ssh
sudo ufw --force enable
```

---

## 🌐 Етап 3: Apache + SSL з Canary (виправлено!)
```bash
sudo nano /etc/apache2/sites-available/movie-app.conf
```
```apache
<VirtualHost *:80>
    ServerName vash-domen.com
    ProxyRequests Off
    ProxyPreserveHost On
    RewriteEngine On

    # Canary для IP (приклад)
    RewriteCond %{REMOTE_ADDR} =192.168.1.1 [OR]
    RewriteCond %{REMOTE_ADDR} ^10\.0\.0\.
    RewriteRule ^/(.*)$ http://localhost:3002/$1 [P,L]

    # Основний трафік
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/

    # Розділення логів
    SetEnvIf Remote_Addr "192\.168\.1\.1" CANARY
    SetEnvIf Remote_Addr "^10\.0\.0\." CANARY
    CustomLog ${APACHE_LOG_DIR}/movie-app-main.log combined env=!CANARY
    CustomLog ${APACHE_LOG_DIR}/movie-app-canary.log combined env=CANARY

    ErrorLog ${APACHE_LOG_DIR}/movie-app-error.log
</VirtualHost>
```
```bash
sudo a2ensite movie-app.conf
sudo certbot --apache -d vash-domen.com
```

---

## 🚀 Етап 4: Розгортання додатку
```bash
sudo su - deploy-user

# Налаштування Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22

# Для КОЖНОЇ папки (blue/green):
cd /var/www/movie-app-blue
git clone <URL_РЕПОЗИТОРІЯ> .
echo "PORT=3001" > .env && chmod 600 .env

# Health-check endpoint (додати в server.js)
app.get('/health', (req, res) => res.status(200).send('OK'));

# PM2 (виконується ОДИН РАЗ!)
npm install -g pm2
pm2 startup  # Виконати команду, яку він покаже (з sudo)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 10

# Запуск
pm2 start server.js --name movie-app-blue -- --port 3001
pm2 save
```

---

## 🤖 Етап 5: Оновлений deploy.sh (з rollback!)
```bash
nano ~/deploy.sh
```
```bash
#!/bin/bash
set -euo pipefail
BLUE="/var/www/movie-app-blue"
GREEN="/var/www/movie-app-green"
BACKUP_DIR="/var/www/backups"
LOG="$HOME/deploy.log"
CANARY=false
PROMOTE=false
ROLLBACK=false

# Парсинг аргументів
while [[ $# -gt 0 ]]; do
    case "$1" in
        --canary) CANARY=true ;;
        --promote) PROMOTE=true ;;
        --rollback) ROLLBACK=true ;;
        *) echo "Невідомий аргумент: $1" >> "$LOG"; exit 1 ;;
    esac
    shift
done

# Rollback
if $ROLLBACK; then
    LAST_BACKUP=$(ls -td "$BACKUP_DIR"/movie-app-blue-* | head -1)
    [[ -z "$LAST_BACKUP" ]] && { echo "❌ Бекапи відсутні" >> "$LOG"; exit 1; }

    echo "--- 🔄 ROLLBACK до $LAST_BACKUP ---" >> "$LOG"
    rsync -a --delete "$LAST_BACKUP/" "$BLUE/"
    pm2 restart movie-app-blue >> "$LOG"
    echo "✅ Відновлено з бекапу" >> "$LOG"
    exit 0
fi

# Promote
if $PROMOTE; then
    echo "--- 📈 PROMOTE green -> blue ---" >> "$LOG"
    [[ "$BLUE" == "/var/www/movie-app-blue" ]] || { echo "❌ Небезпечний шлях!" >> "$LOG"; exit 1; }

    rsync -a --delete "$GREEN/" "$BLUE/"
    sed -i 's/PORT=3002/PORT=3001/' "$BLUE/.env"
    pm2 restart movie-app-blue >> "$LOG"
    echo "✅ Green промоутнуто. Видаліть IP з Apache!" >> "$LOG"
    exit 0
fi

# Canary/Standard deploy
if $CANARY; then
    TARGET="$GREEN"; APP="movie-app-green"; PORT=3002
    echo "--- 🐤 CANARY деплой ---" >> "$LOG"
else
    TARGET="$BLUE"; APP="movie-app-blue"; PORT=3001
    echo "--- 🔄 СТАНДАРТНИЙ деплой ---" >> "$LOG"
fi

# Бекап перед деплоєм
[[ ! -d "$BACKUP_DIR" ]] && mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/movie-app-blue-$(date +%Y%m%d-%H%M%S)"
rsync -a "$BLUE/" "$BACKUP_PATH"  # Тільки для blue

# Оновлення коду
cd "$TARGET"
git pull >> "$LOG"
npm install >> "$LOG"

# Перевірка health
pm2 restart "$APP" >> "$LOG"
sleep 5  # Чекаємо на запуск
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/health")
[[ "$HTTP_CODE" -ne 200 ]] && { echo "❌ Health-check failed ($HTTP_CODE)" >> "$LOG"; exit 1; }

# Версіонування
echo "✅ Успішно! Версія: $(git rev-parse --short HEAD)" >> "$LOG"
```
```bash
chmod +x ~/deploy.sh
```

---

## 🛡️ Етап 6: Моніторинг та бекапи
```bash
# Автоматичні бекапи (cron)
sudo crontab -e
```
```cron
0 3 * * * rsync -a --delete /var/www/movie-app-blue /var/www/backups/movie-app-blue-$(date +\%Y\%m\%d)
0 4 * * * find /var/www/backups -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Тестування health-check
curl -I http://localhost:3001/health
curl -I http://localhost:3002/health

# Перегляд логів
tail -f /var/log/apache2/movie-app-{main,canary}.log
pm2 logs
```

---

## ✅ Життєвий цикл Canary
1. **Тестовий деплой:**
   ```bash
   ./deploy.sh --canary
   ```
   - Додати тестові IP в `/etc/apache2/sites-available/movie-app.conf`
   - `sudo apache2ctl graceful`

2. **Моніторинг:**
   ```bash
   tail -f /var/log/apache2/movie-app-canary.log
   pm2 logs movie-app-green
   ```

3. **Промоушен або відкат:**
   ```bash
   # Якщо успішно:
   ./deploy.sh --promote

   # Якщо проблема:
   ./deploy.sh --rollback  # Відкат blue
   # Видалити IP з Apache
   ```

---

## 🔧 Додаткові поради
1. **Обмеження доступу до Node.js:**
   Додати в код додатку:
   ```javascript
   app.listen(port, '127.0.0.1');  // Тільки localhost
   ```

2. **Перевірка конфігурації:**
   ```bash
   sudo apache2ctl configtest
   ```

3. **Екстрене відключення Canary:**
   Видалити IP з конфігу Apache + `sudo apache2ctl graceful`

4. **Аварійний доступ:**
   Додати резервний SSH-ключ у `~/.ssh/authorized_keys`

> **Важливо:** Завжди тестуйте конфіг Apache після змін!
> Повна документація: [Apache Rewrite Guide](https://httpd.apache.org/docs/2.4/rewrite/)