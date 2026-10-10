import { useId } from "react";
export default function TextInput({
  label,
  type = "text",
  required = false,
  hint,
  error,
  id,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const describedBy =
    [
      props["aria-describedby"],
      hint && `${fieldId}-hint`,
      error && `${fieldId}-error`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={fieldId}>{label}</label>
        {required && (
          <span className="field-required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </div>
      <input
        {...props}
        id={fieldId}
        type={type}
        required={required}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={describedBy}
      />
      {hint && <small id={`${fieldId}-hint`}>{hint}</small>}
      {error && (
        <small className="field-error" id={`${fieldId}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}
