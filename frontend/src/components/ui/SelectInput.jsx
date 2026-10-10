import { useId } from "react";

function SelectInput({
  label,
  value,
  onChange,
  options = [],
  required = false,
  ...props
}) {
  const id = useId();
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {required && (
          <span className="field-required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      >
        {!options.some((option) => String(option.value) === "") && (
          <option value="">Selecione</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectInput;
