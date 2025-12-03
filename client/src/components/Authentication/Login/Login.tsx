import { Link } from "react-router-dom";
import { useState } from "react";
import style from "./Login.module.css";
import logo from "../../../assets/surflog_logo_bw.png";
import { useLogin } from "../useLogin.ts";

function Login() {
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(false);
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();

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
    await login(email, password);
  };

  return (
    <div className={style.pageWrapper}>
      {error && (
        <p className={style.loginError} role="alert">
          {error}
        </p>
      )}
      <form onSubmit={onFormSubmit} className={style.loginForm}>
        <img src={logo} alt="Surflog Logo" className={style.logo} />
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!emailIsValid || !password || isLoading}
          className={
            !emailIsValid || !password || isLoading
              ? style.btnDisabled
              : style.btnActive
          }
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        <p>
          If you do not have an account yet,{" "}
          <Link to="/sign-up" className={style.linkSignUp}>
            sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;