import { body, query, param } from "express-validator";

const emailValidationChain = ({ fieldname = "email", isOptional = false } = {}) => {
    let emailChain = body(fieldname);

    if (isOptional)
        emailChain = emailChain.optional();

    return emailChain
        .trim()
        .notEmpty().withMessage("Email is empty.")
        .isEmail().withMessage("Invalid email format.")
}

const passwordValidationChain = ({ fieldname = "password", isOptional = false } = {}) => {
    let passwordChain = body(fieldname);

    if(isOptional)
        passwordChain = passwordChain.optional();

    return passwordChain
    .trim()
    .notEmpty().withMessage("Password is empty.")
    .isStrongPassword().withMessage("Password is not strong enough.")
}

const ageValidationChain = ({fieldname = "age", isOptional = false} = {}) => {
    let chain = body(fieldname);

    if(isOptional)
        chain = chain.optional();

    return chain
    .isInt({ min: 0, max: 150, allow_leading_zeroes: false }).withMessage("Age must be a valid integer.")
}

const nameValidationChain = ({fieldname = "name", isOptional = false} = {}) => {
    let chain = body(fieldname);

    if(isOptional)
        chain = chain.optional();

    return chain
    .trim()
    .notEmpty().withMessage("Name is empty.")
    .matches(/^[A-Za-z\s'-]+$/).withMessage("Name must be a string.")
}

const idValidationChain = ({fieldname = "id"} = {}) => {
    return param(fieldname)
    .trim()
    .notEmpty().withMessage("Id was not provided")
    .isInt({min: 0}).withMessage("Id is invalid.");
}

export {
    emailValidationChain,
    passwordValidationChain,
    ageValidationChain,
    nameValidationChain,
    idValidationChain
}