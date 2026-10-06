function Loading({ text = "Carregando..." }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

export default Loading;