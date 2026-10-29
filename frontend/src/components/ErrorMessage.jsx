export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state" role="alert">
      <p className="error-title">{title}</p>
      <p className="muted">{message}</p>
      {onRetry && (
        <button className="ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
