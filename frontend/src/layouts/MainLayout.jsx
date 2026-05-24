import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />

      <div>
        <Sidebar />

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;