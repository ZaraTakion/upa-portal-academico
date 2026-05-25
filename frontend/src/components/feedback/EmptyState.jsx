function EmptyState({
  title = "Nada encontrado",
  message = "Não há dados para exibir no momento.",
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;