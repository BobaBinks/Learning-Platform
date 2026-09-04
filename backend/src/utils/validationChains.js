import { body, query } from "express-validator";

const emailValidationChain = ({ fieldname = "email", isOptional = false } = {}) => {
    let emailChain = body(fieldname);

    if (isOptional)
        emailChain = emailChain.optional();

    return emailChain
        .trim()
        .notEmpty().withMessage("Email is empty.")
        .isEmail().withMessage("Invalid email format.")
        .escape();
}

const passwordValidationChain = ({ fieldname = "password", isOptional = false } = {}) => {
    let passwordChain = body(fieldname);

    if(isOptional)
        passwordChain = passwordChain.optional();

    return passwordChain
    .trim()
    .notEmpty().withMessage("Password is empty.")
    .isStrongPassword().withMessage("Password is not strong enough.")
    .escape();
}

export {
    emailValidationChain,
    passwordValidationChain
}