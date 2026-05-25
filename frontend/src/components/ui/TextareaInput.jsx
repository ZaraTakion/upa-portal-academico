function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </label>
  );
}

export default TextareaInput;