import styles from "./Sidebar.module.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  // get routing to set link as active
  // get user to use id for links

  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebarBlock}>
        <Link to="/main">Main Feed</Link>
      </div>

      <div className={styles.sidebarBlock}>
        <Link to="/my-sessions">My Sessions</Link>
        <Link to="/add-session">Add Session</Link>
      </div>

      <div className={styles.sidebarBlock}>
        <Link to="/my-quiver">My Quiver</Link>
        <Link to="/edit-profile">Edit Profile</Link>
      </div>

      <div className={styles.sidebarBlock}>
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
}
