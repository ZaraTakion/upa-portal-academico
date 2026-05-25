import { useState } from "react";
import MobileTopbar from "./MobileTopbar";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <MobileTopbar onOpenMenu={() => setSidebarOpen(true)} />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <div className="app-content">
        <Navbar />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;