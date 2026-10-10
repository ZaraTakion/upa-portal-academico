function Alert({ type = "info", message, onRetry }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
      {onRetry && <button className="btn btn-secondary" type="button" onClick={onRetry}>Tentar novamente</button>}
    </div>
  );
}

export default Alert;