import { useAuth } from "../useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { MdOutlineLogout } from "react-icons/md";
import style from "./LogOut.module.css";

type LogOutProps = {
  className: string;
};

function LogOut({ className }: LogOutProps) {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logOutHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    localStorage.removeItem("token");

    setUser(null);

    navigate("/");
  };

  return (
    <button
      onClick={logOutHandler}
      className={`${style.logOutButton} ${className || ""}`}
    >
      <MdOutlineLogout size={"1.5em"} />
      Log Out
    </button>
  );
}

export default LogOut;
