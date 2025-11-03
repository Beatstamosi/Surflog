import { body } from "express-validator";

const capitalizeWords = (value: string) => {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const validateSignUp = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .customSanitizer(capitalizeWords),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .customSanitizer(capitalizeWords),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // IF NEEDED ADD PASSWORD VALIDATION
];
