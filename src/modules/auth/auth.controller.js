import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as registrationService from "./services/registration.service.js";
import * as loginService from "./services/login.service.js";
import * as validators from "./auth.validation.js"
import { authentication } from "../../middleware/auth.middlware.js";
const router = Router()

// Registration & Login
router.post('/signup', validation(validators.signup), registrationService.signup)
router.patch('/confirm-email', validation(validators.confirmEmail), registrationService.confirmEmail)
router.post('/login', validation(validators.login), loginService.login, loginService.twoStepVerification)
router.get('/refresh-token', validation(validators.refreshToken), loginService.refreshToken)

// Forgot Password
router.patch('/forgot-password', validation(validators.forgotPassword), loginService.forgotPassword)
router.patch('/validate-forgot-password', validation(validators.validateForgotPassword), loginService.validateForgotPassword)
router.patch('/reset-password', validation(validators.resetPassword), loginService.resetPassword)

// social login
router.post('/login-with-gmail', loginService.loginWithGmail)

// Two Step Verification
router.patch('/enable-two-step-verification', validation(validators.enableTwoStepVerification), authentication(), loginService.enableTwoStepVerification)
router.patch('/verify-enable-two-step-verification', validation(validators.verifyEnableTwoStepVerification), authentication(), loginService.verifyEnableTwoStepVerification)
router.post('/two-step-verification', validation(validators.twoStepVerification), authentication(), loginService.twoStepVerification, loginService.twoStepVerification)

export default router