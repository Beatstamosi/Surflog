import App from "../App";
import ErrorPage from "./ErrorPage/ErrorPage.jsx";
import Login from "./Authentication/Login/Login.jsx";
import SignUp from "./Authentication/Sign Up/SignUp.jsx";
import RequireAuth from "./Authentication/RequireAuth.jsx";
import TestForecast from "./TestForecast.js";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/forecast",
        element: <TestForecast />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
];

export default routes;
