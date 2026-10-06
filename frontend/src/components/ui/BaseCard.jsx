function BaseCard({ children, className = "", ...props }) {
  return (
    <article className={`base-card ${className}`} {...props}>
      {children}
    </article>
  );
}

export default BaseCard;