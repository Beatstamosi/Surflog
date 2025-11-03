import { useAuth } from "../useAuth.jsx";
import { useNavigate } from "react-router-dom";

function LogOut() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logOutHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    localStorage.removeItem("token");

    setUser(null);

    navigate("/");
  };

  return <button onClick={(e) => logOutHandler(e)}>Log Out</button>;
}

export default LogOut;
