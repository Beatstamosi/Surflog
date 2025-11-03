import { useState, useEffect } from "react";
import style from "./SignUp.module.css";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

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

  const navigate = useNavigate();

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
        `${import.meta.env.VITE_API_BASE_URL}/user/check-email`,
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
        console.log(data.exists);
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

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/sign-up`,
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
        console.error("Failed to sign up user", data.error);
      }
    } catch (err) {
      console.error("Error signing up user:", err);
    }
  };

  return (
    <div className={style.pageWrapper}>
      <form
        onSubmit={onFormSubmit}
        className={style.formContainer}
        aria-label="Sign up form"
      >
        <h1>Sign Up</h1>

        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Enter your First Name"
          aria-label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Enter your Last Name"
          aria-label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        {email && !emailIsValid && (
          <p id="emailWrong" className={style.emailWrongWarning} role="alert">
            Please enter valid E-Mail.
          </p>
        )}
        {email && userNameExists && (
          <p id="emailExists" className={style.emailWrongWarning} role="alert">
            User with this E-mail already exists.
          </p>
        )}
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your Email"
          aria-label="Email"
          value={email}
          onChange={(e) => emailChange(e)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          aria-label="Confirm Password"
          aria-describedby={!passwordMatch ? "passwordHelp" : undefined}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          aria-disabled={!formFilled}
          aria-label="Submit sign up form"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
