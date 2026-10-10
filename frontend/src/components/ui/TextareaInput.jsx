import { useId } from "react";
export default function TextareaInput({
  label,
  rows = 5,
  required = false,
  id,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
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
      <textarea {...props} id={fieldId} rows={rows} required={required} />
    </div>
  );
}
