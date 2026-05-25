function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </label>
  );
}

export default TextInput;