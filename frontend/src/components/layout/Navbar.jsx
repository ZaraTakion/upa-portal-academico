import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  return (
    <header>
      <h2>UPA</h2>

      <button type="button" onClick={handleLogout}>
        Sair
      </button>
    </header>
  );
}

export default Navbar;