import style from "./Sidebar.module.css";
import { Link, useLocation } from "react-router-dom";
import { GiWaveSurfer } from "react-icons/gi";
import { MdOutlineSurfing } from "react-icons/md";
import { GiSurferVan } from "react-icons/gi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaUserAstronaut } from "react-icons/fa6";
import surfLogLogo from "../../assets/surflog_logo_bw.png";
import LogOutBtn from "../Authentication/LogOut/LogOutBtn";
import { useAuth } from "../Authentication/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  return (
    <div className={style.sidebarWrapper}>
      <div className={style.wrapperLogo}>
        <img src={surfLogLogo} alt="Wavelog Logo" />
      </div>

      <div className={style.sidebarBlock}>
        <Link
          to="/"
          className={`${style.sidebarLink} ${
            currentPath === "/" ? style.active : ""
          }`}
        >
          <GiWaveSurfer size={"1.5em"} />
          Feed
        </Link>
      </div>

      <div className={style.sidebarBlock}>
        <Link
          to="/my-sessions"
          className={`${style.sidebarLink} ${
            currentPath === "/my-sessions" ? style.active : ""
          }`}
        >
          <MdOutlineSurfing size={"1.5em"} />
          My Sessions
        </Link>

        <Link
          to="/add-session"
          className={`${style.sidebarLink} ${
            currentPath === "/add-session" ? style.active : ""
          }`}
        >
          <IoIosAddCircleOutline size={"1.5em"} />
          Add Session
        </Link>
      </div>

      <div className={style.sidebarBlock}>
        <Link
          to="/my-quiver"
          className={`${style.sidebarLink} ${
            currentPath === "/my-quiver" ? style.active : ""
          }`}
        >
          <GiSurferVan size={"1.5em"} />
          My Quiver
        </Link>

        <Link
          to={`/user/${user?.id}`}
          className={`${style.sidebarLink} ${
            currentPath === `/user/${user?.id}` ||
            currentPath.includes("edit-profile")
              ? style.active
              : ""
          }`}
        >
          <FaUserAstronaut size={"1.5em"} />
          My Profile
        </Link>
      </div>

      <div className={style.sidebarBlock}>
        <LogOutBtn className={style.sidebarLink} />
      </div>
    </div>
  );
}
