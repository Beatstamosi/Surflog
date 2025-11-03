import passport from "passport";

const validateJWTToken = passport.authenticate("jwt", { session: false });

export default validateJWTToken;
