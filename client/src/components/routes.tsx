import App from "../App";
import ErrorPage from "./ErrorPage/ErrorPage.jsx";
import LogOut from "./Authentication/LogOut/LogOut.jsx";
import Login from "./Authentication/Login/Login.jsx";
import SignUp from "./Authentication/Sign Up/SignUp.jsx";
import RequireAuth from "./Authentication/RequireAuth.jsx";

const routes = [
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/logout",
    element: (
      <RequireAuth>
        <LogOut />
      </RequireAuth>
    ),
  },
];

export default routes;
