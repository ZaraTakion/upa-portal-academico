function PageHeader({ eyebrow, title, description, action }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action && <div className="page-header-action">{action}</div>}
    </section>
  );
}

export default PageHeader;