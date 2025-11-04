import { Outlet } from "react-router-dom";
import { useAuth } from "./components//Authentication/useAuth.jsx";
import { useMediaQuery } from "react-responsive";
import style from "./App.module.css";
import Sidebar from "./components/Sidebar/Sidebar.js";

function App() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { loading } = useAuth();

  if (loading) return <h1>Loading...</h1>;

  // if desktop display:
  // navbar as sidebar
  // Outlet on the right

  if (isDesktop) {
    return (
      <>
        <div className={style.pageWrapperDesktop}>
          <Sidebar />
          <Outlet />
          // Footer
        </div>
      </>
    );
  } else {
    return (
      <>
        <div>Navbar Mobile</div>
        <Outlet />
        // Footer
      </>
    );
  }

  // if mobile
  // navbar logo + hamburger
  // outlet below
}

export default App;
