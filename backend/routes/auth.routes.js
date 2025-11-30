const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = authController.verifyToken;

const validate = require("../middleware/validate");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
} = require("../validators/auth.validator");

// REGISTER
router.post("/register", registerValidator, validate, authController.register);

// LOGIN
router.post("/login", loginValidator, validate, authController.login);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPasswordValidator, validate, authController.forgotPassword);

// RESET PASSWORD
router.post("/reset-password", resetPasswordValidator, validate, authController.resetPassword);

// CHANGE PASSWORD
router.post("/change-password", auth, changePasswordValidator, validate, authController.changePassword);



// LOGOUT
router.post("/logout", auth, authController.logout);

router.post("/admin-login", loginValidator, validate, authController.adminLogin);


module.exports = router;
