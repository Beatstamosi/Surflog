import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import style from "./Login.module.css";
import { useAuth } from "../useAuth.tsx";
import logo from "../../../assets/surflog_logo_bw.png";

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
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
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
        fetchUser();
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
      {loginFailed ? <p>Email or password is wrong</p> : null}
      <form onSubmit={onFormSubmit} className={style.loginForm}>
        <img src={logo} alt="Whisp Logo" className={style.logo} />
        <h2 className={style.formTitle}>Login</h2>
        <label htmlFor="email" className={style.labelLoginForm}>
          E-Mail
        </label>
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
          className={style.loginFormInput}
        />
        <label htmlFor="password" className={style.labelLoginForm}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={style.loginFormInput}
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
          <Link to="/sign-up" className={style.linkSignUp}>sign up here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
