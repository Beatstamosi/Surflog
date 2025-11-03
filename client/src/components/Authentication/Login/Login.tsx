import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import style from "./Login.module.css";
import { useAuth } from "../useAuth.tsx";

function Login() {
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(false);
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const { fetchUser } = useAuth();

  const navigate = useNavigate();

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target;
    setEmail(emailInput.value);

    if (emailInput.validity.valid) {
      setEmailIsValid(true);
    } else {
      setEmailIsValid(false);
    }
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        await fetchUser();
        navigate("/");
      } else {
        setLoginFailed(true);
        console.error("Failed to login user", data.error);
      }
    } catch (err) {
      console.error("Error logging in user:", err);
    }
  };

  return (
    <div className={style.pageWrapper}>
      <h1>Login</h1>
      {loginFailed ? <p>Email or password is wrong</p> : null}
      <form onSubmit={onFormSubmit}>
        <label htmlFor="email">E-Mail</label>
        {email && !emailIsValid && (
          <p id="emailWrong" className={style.emailWrongWarning} role="alert">
            Please enter valid E-Mail.
          </p>
        )}
        <input
          id="email"
          name="email"
          placeholder="Enter E-Mail"
          type="email"
          value={email}
          onChange={(e) => emailChange(e)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={!emailIsValid || !password}
          className={
            !emailIsValid || !password ? style.btnDisabled : style.btnActive
          }
        >
          Log In
        </button>
        <p>
          If you do not have an account yet,{" "}
          <Link to="/sign-up">sign up here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
