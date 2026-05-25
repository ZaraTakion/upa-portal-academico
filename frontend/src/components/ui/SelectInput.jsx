function SelectInput({ label, value, onChange, options = [], required = false }) {
  return (
    <label className="field">
      <span>{label}</span>

      <select value={value} onChange={onChange} required={required}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectInput;