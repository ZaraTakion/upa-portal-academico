function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;