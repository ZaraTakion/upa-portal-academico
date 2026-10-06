import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      {sidebarOpen && (
        <button type="button" className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação" />
      )}
      <div className="app-content">
        <Navbar sidebarOpen={sidebarOpen} onOpenMenu={() => setSidebarOpen(true)} />
        <main id="main-content" className="main-content" tabIndex="-1">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
