import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import style from "./SignUp.module.css";
import { useDebouncedCallback } from "use-debounce";
import logo from "../../../assets/surflog_logo_bw.png";
import { useLogin } from "../useLogin";

function SignUp() {
  // --- PASSPHRASE GATE STATE ---
  const [passphrase, setPassphrase] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const SIGNUP_SECRET =
    import.meta.env.VITE_SIGNUP_PASSPHRASE;

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
  const [signUpErrorMessage, setSignUpErrorMessage] = useState<string | null>(
    null
  );

  const { login, isLoading: isLoggingIn } = useLogin();

  // --- PASSPHRASE HANDLER ---
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === SIGNUP_SECRET) {
      setIsAuthorized(true);
    } else {
      setSignUpFailed(true);
      setSignUpErrorMessage(
        "Wrong passphrase. Check the GitHub repo for the key! 🤙"
      );
    }
  };

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

  const handleSignUp = async () => {
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
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Sign up failed",
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpFailed(false);
    setSignUpErrorMessage(null);

    // Sign up the user
    const signUpResult = await handleSignUp();

    if (!signUpResult.success) {
      setSignUpFailed(true);
      setSignUpErrorMessage(signUpResult.error || "Sign up failed");
      return;
    }

    // Auto-login after successful signup
    const loginResult = await login(email, password, "/edit-profile");

    if (!loginResult.success) {
      // If auto-login fails, show message but signup was successful
      setSignUpFailed(true);
      setSignUpErrorMessage(
        "Account created successfully! Please login manually."
      );
    }
    // If login is successful, the hook will handle navigation to "/"
  };

  const isSubmitting = signUpFailed || isLoggingIn;

  if (!isAuthorized) {
    return (
      <div className={style.pageWrapper}>
        <div className={style.signUpForm}>
          <img src={logo} alt="Surflog Logo" className={style.logo} />
          <h2 className={style.formTitle}>Private MVP</h2>
          <p className={style.gateText}>
            Public registration is disabled to manage API costs. If you're a
            developer, find the secret key in the repo to unlock sign-up.
          </p>

          <form onSubmit={handleVerify} className={style.gateForm}>
            <input
              type="text"
              placeholder="Enter secret passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className={style.signUpFormInput}
              required
            />
            {signUpFailed && (
              <p className={style.signUpFailedWarning}>{signUpErrorMessage}</p>
            )}
            <button type="submit" className={style.btnActive}>
              Unlock Form
            </button>
          </form>

          <p className={style.signUpFormFooter}>
            Just browsing?{" "}
            <Link to="/login" className={style.linkLogin}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageWrapper}>
      {signUpFailed && signUpErrorMessage && (
        <p className={style.signUpFailedWarning} role="alert">
          {signUpErrorMessage}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={!formFilled || isSubmitting}
          className={
            !formFilled || isSubmitting ? style.btnDisabled : style.btnActive
          }
        >
          {isLoggingIn ? "Creating Account..." : "Sign Up"}
        </button>

        <p className={style.signUpFormFooter}>
          Already have an account?{" "}
          <Link to="/login" className={style.linkLogin}>
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
