import ErrorPlaceholder from "./ErrorPlaceholder";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <ErrorPlaceholder
      message={`An error occurred: ${error.message}. Error code: ${
        error.code || "N/A"
      }`}
      onRetry={resetErrorBoundary}
    />
  );
};

export default ErrorFallback;
