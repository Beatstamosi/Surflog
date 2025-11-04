import styles from "./Sidebar.module.css";
import { Link } from "react-router-dom";
import { GiWaveSurfer } from "react-icons/gi";
import { MdOutlineSurfing } from "react-icons/md";
import { GiSurferVan } from "react-icons/gi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaUserEdit } from "react-icons/fa";
import surfLogLogo from "../../assets/surflog_logo.png";
import { useAuth } from "../Authentication/useAuth";
import LogOut from "../Authentication/LogOut/LogOut";

// TODO: get routing to set link as active

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.wrapperLogo}>
        <img src={surfLogLogo} alt="Wavelog Logo" />
      </div>
      <div className={styles.sidebarBlock}>
        <Link to={`/main/${user?.id}`} className={styles.sidebarLink}>
          <GiWaveSurfer size={"1.5em"} />
          Feed
        </Link>
      </div>

      <div className={styles.sidebarBlock}>
        <Link to={`/my-sessions/${user?.id}`} className={styles.sidebarLink}>
          <MdOutlineSurfing size={"1.5em"} />
          My Sessions
        </Link>
        <Link to={`/add-session/${user?.id}`} className={styles.sidebarLink}>
          <IoIosAddCircleOutline size={"1.5em"} />
          Add Session
        </Link>
      </div>

      <div className={styles.sidebarBlock}>
        <Link to={`/my-quiver/${user?.id}`} className={styles.sidebarLink}>
          <GiSurferVan size={"1.5em"} />
          My Quiver
        </Link>
        <Link to={`/edit-profile/${user?.id}`} className={styles.sidebarLink}>
          <FaUserEdit size={"1.5em"} />
          My Profile
        </Link>
      </div>

      <div className={styles.sidebarBlock}>
        <LogOut className={styles.sidebarLink} />
      </div>
    </div>
  );
}
