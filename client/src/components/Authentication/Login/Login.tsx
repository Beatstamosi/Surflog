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
        <div className={style.demoNote}>
          <p>
            <strong>Project Note:</strong> This is an MVP demonstrating live API
            integration. Public sign-up is disabled to manage API usage. If you
            do not have the public account info, please{" "}
            <a
              href="mailto:moritz.lued@gmail.com?subject=Test%20Account%20Request&body=Hi,%20I'd%20like%20to%20request%20a%20test%20account%20for%20your%20Surf%20App!"
              className={style.contactLink}
            >
              contact me for a test account
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
