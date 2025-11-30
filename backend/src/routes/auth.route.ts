import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  googleLoginInitiate,
  loginController,
  logOutController,
  registerUserController,
} from "../controllers/auth.controller";
import {
  authLimiter,
  oauthLimiter,
  registerLimiter,
} from "../config/rateLimit.config";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.post("/register", registerLimiter, registerUserController);

authRoutes.post("/login", authLimiter, loginController);

authRoutes.post("/logout", logOutController);

authRoutes.get("/google", oauthLimiter, googleLoginInitiate);

authRoutes.get(
  "/google/callback",
  oauthLimiter,
  passport.authenticate("google", {
    failureRedirect: failedUrl,
    failureMessage: true,
  }),
  googleLoginCallback
);

export default authRoutes;
