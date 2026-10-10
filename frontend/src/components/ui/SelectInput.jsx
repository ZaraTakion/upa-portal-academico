import { useId } from "react";

function SelectInput({ label, value, onChange, options = [], required = false, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange} required={required} {...props}>
        {!options.some((option) => String(option.value) === "") && <option value="">Selecione</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

export default SelectInput;
