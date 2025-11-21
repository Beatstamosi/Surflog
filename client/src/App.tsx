import { Outlet } from "react-router-dom";
import { useAuth } from "./components//Authentication/useAuth.jsx";
import { useMediaQuery } from "react-responsive";
import style from "./App.module.css";
import Sidebar from "./components/Sidebar/Sidebar.js";
import Footer from "./components/Footer/Footer.js";
import NavBarMobile from "./components/NavbarMobile/NavBarMobile.js";
import ScrollToTop from "./utils/ScrollToTop.js";

function App() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { loading } = useAuth();

  if (loading) return <h1>Loading...</h1>;

  if (isDesktop) {
    return (
      <>
        <div className={style.pageWrapperDesktop}>
          <Sidebar />
          <div className={style.mainContent}>
            <ScrollToTop />
            <Outlet />
          </div>
        </div>
        <div className={style.wrapperFooter}>
          <Footer />
        </div>
      </>
    );
  } else {
    return (
      <div className={style.pageWrapperMobile}>
        <Outlet />
        <NavBarMobile />
      </div>
    );
  }
}

export default App;
