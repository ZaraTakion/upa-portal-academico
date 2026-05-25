function Alert({ type = "info", message }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
    </div>
  );
}

export default Alert;