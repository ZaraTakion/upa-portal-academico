function Badge({ children, type = "neutral" }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

export default Badge;