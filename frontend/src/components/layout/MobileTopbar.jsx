function MobileTopbar({ onOpenMenu }) {
  return (
    <header className="mobile-topbar">
      <button type="button" onClick={onOpenMenu} aria-label="Abrir menu">
        ☰
      </button>

      <strong>UPA</strong>
    </header>
  );
}

export default MobileTopbar;