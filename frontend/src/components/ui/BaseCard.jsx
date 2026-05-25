function BaseCard({ children, className = "" }) {
  return <article className={`base-card ${className}`}>{children}</article>;
}

export default BaseCard;