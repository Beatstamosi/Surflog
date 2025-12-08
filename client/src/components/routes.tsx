import App from "../App";
import ErrorPage from "./ErrorPage/ErrorPage.jsx";
import Login from "./Authentication/Login/Login.jsx";
import SignUp from "./Authentication/Sign Up/SignUp.jsx";
import RequireAuth from "./Authentication/RequireAuth.jsx";
import Feed from "./Feed/Feed.js";
import MySessions from "./ MySessions/MySessions.js";
import AddSession from "./AddSession/AddSession.js";
import MyQuiver from "./MyQuiver/MyQuiver.js";
import MyProfile from "./MyProfile/MyProfile.js";
import ViewPublicProfile from "./ViewPublicProfile/ViewPublicProfile.js";
import ViewPublicPost from "./ViewPublicPost/ViewPublicPost.js";

const routes = [
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Feed />,
      },
      {
        path: "/my-sessions",
        element: <MySessions />,
      },
      {
        path: "/add-session",
        element: <AddSession />,
      },
      {
        path: "/my-quiver",
        element: <MyQuiver />,
      },
      {
        path: "/edit-profile",
        element: <MyProfile />,
      },
      {
        path: "/user/:profileId",
        element: <ViewPublicProfile />,
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
  {
    path: "/post/:postId",
    element: <ViewPublicPost />,
  },
  {
    path: "/error",
    errorElement: <ErrorPage />,
  },
];

export default routes;
