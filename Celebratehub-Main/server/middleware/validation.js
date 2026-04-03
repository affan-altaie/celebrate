const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  validate,
  paymentCardValidation: [
    body("cardHolderName")
      .notEmpty().withMessage("Card holder name is required")
      .matches(/^[a-zA-Z\s]+$/).withMessage("Card holder name can only contain letters and spaces"),
    body("cardNumber")
      .notEmpty().withMessage("Card number is required")
      .isLength({ min: 16, max: 16 }).withMessage("Card number must be 16 digits")
      .isNumeric().withMessage("Card number must be numeric"),
    body("expiryDate")
      .notEmpty().withMessage("Expiry date is required")
      .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).withMessage("Expiry date must be in MM/YY format")
      .custom((value, { req }) => {
        const [month, year] = value.split("/").map(Number);
        const fullYear = 2000 + year;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
          throw new Error("Expiry date cannot be in the past");
        }
        return true;
      }),
    body("cvc")
      .notEmpty().withMessage("CVC is required")
      .isLength({ min: 3, max: 4 }).withMessage("CVC must be 3 or 4 digits")
      .isNumeric().withMessage("CVC must be numeric"),
  ],
};
