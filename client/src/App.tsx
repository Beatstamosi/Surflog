import { useAuth } from "./components//Authentication/useAuth.jsx";
import LogOut from "./components/Authentication/LogOut/LogOut.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <h1>{user?.email || "No user found"}</h1>
      <p>
        {user?.firstName} {user?.lastName}
      </p>
      <LogOut />
    </>
  );
}

export default App;
