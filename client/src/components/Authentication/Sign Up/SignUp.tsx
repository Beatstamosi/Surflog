import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import style from "./SignUp.module.css";
import { useDebouncedCallback } from "use-debounce";
import logo from "../../../assets/surflog_logo_bw.png";

function SignUp() {
  const [email, setEmail] = useState("");
  const [emailIsValid, setEmailIsValid] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [userNameExists, setUserNameExists] = useState(false);
  const [signUpFailed, setSignUpFailed] = useState(false);

  const navigate = useNavigate();

  // Password needs to match warning
  useEffect(() => {
    if (password === confirmPassword && password && confirmPassword) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [password, confirmPassword]);

  // Check if form is filled to enable submit button
  useEffect(() => {
    if (
      firstName &&
      lastName &&
      email &&
      emailIsValid &&
      password &&
      confirmPassword &&
      passwordMatch &&
      !userNameExists
    ) {
      setFormFilled(true);
    } else {
      setFormFilled(false);
    }
  }, [
    email,
    firstName,
    lastName,
    password,
    confirmPassword,
    passwordMatch,
    emailIsValid,
    userNameExists,
  ]);

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
  };

  const checkForEmailExists = async (emailToCheck: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: emailToCheck,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUserNameExists(data.exists);
      } else {
        console.error("Failed to check if email exists: ", data.error);
      }
    } catch (err) {
      console.error(`Error checking if user exists: ${err} `);
    }
  };

  const debounce = useDebouncedCallback(checkForEmailExists, 500);

  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = e.target;
    setEmail(emailInput.value);

    if (emailInput.validity.valid) {
      setEmailIsValid(true);
      debounce(emailInput.value);
    } else {
      setEmailIsValid(false);
    }
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpFailed(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
          }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        resetForm();
        navigate("/login");
      } else {
        setSignUpFailed(true);
        console.error("Failed to sign up user", data.error);
      }
    } catch (err) {
      setSignUpFailed(true);
      console.error("Error signing up user:", err);
    }
  };

  return (
    <div className={style.pageWrapper}>
      {signUpFailed && (
        <p className={style.signUpFailedWarning} role="alert">
          Sign up failed. Please try again.
        </p>
      )}
      
      <form onSubmit={onFormSubmit} className={style.signUpForm}>
        <img src={logo} alt="Surflog Logo" className={style.logo} />
        <h2 className={style.formTitle}>Sign Up</h2>
        
        <label htmlFor="firstName" className={style.labelSignUpForm}>
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Enter First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={style.signUpFormInput}
          required
        />

        <label htmlFor="lastName" className={style.labelSignUpForm}>
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Enter Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={style.signUpFormInput}
          required
        />

        <label htmlFor="email" className={style.labelSignUpForm}>
          E-Mail
        </label>
        {email && !emailIsValid && (
          <p id="emailWrong" className={style.emailWrongWarning} role="alert">
            Please enter valid E-Mail.
          </p>
        )}
        {email && userNameExists && (
          <p id="emailExists" className={style.emailExistsWarning} role="alert">
            User with this E-Mail already exists.
          </p>
        )}
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter E-Mail"
          value={email}
          onChange={(e) => emailChange(e)}
          className={style.signUpFormInput}
          required
        />

        <label htmlFor="password" className={style.labelSignUpForm}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={style.signUpFormInput}
          required
        />

        <label htmlFor="confirmPassword" className={style.labelSignUpForm}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={style.signUpFormInput}
          required
        />

        {password && confirmPassword && !passwordMatch && (
          <p
            id="passwordHelp"
            className={style.passwordMatchWarning}
            role="alert"
          >
            Passwords need to match.
          </p>
        )}

        <button
          type="submit"
          disabled={!formFilled}
          className={!formFilled ? style.btnDisabled : style.btnActive}
        >
          Sign Up
        </button>
        
        <p className={style.signUpFormFooter}>
          Already have an account?{" "}
          <Link to="/login" className={style.linkLogin}>Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;