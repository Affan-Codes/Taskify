import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { generateOAuthState, isValidRedirectUrl } from "../utils/oauth";

export const googleLoginInitiate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const state = generateOAuthState();
    req.session.oauthState = state;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return next(err);
      }

      // Pass state to Google OAuth
      passport.authenticate("google", {
        scope: ["profile", "email"],
        state: state,
      })(req, res, next);
    });
  }
);

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user._id) {
      console.error("OAuth callback: No user in request");
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure&error=authentication_failed`
      );
    }

    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      console.error("OAuth callback: No workspace for user", req.user._id);
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure&error=no_workspace`
      );
    }

    const redirectUrl = `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`;

    if (!isValidRedirectUrl(redirectUrl, [config.FRONTEND_ORIGIN])) {
      console.error("OAuth callback: Invalid redirect URL", redirectUrl);
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure&error=invalid_redirect`
      );
    }

    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });

    return res.redirect(redirectUrl);
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({ ...req.body });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              currentWorkspace: user.currentWorkspace,
            },
          });
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    req.logOut((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to log out" });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res
            .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
            .json({ error: "Failed to destroy session" });
        }

        // Clear the session cookie
        res.clearCookie("connect.sid"); // Default session cookie name

        return res
          .status(HTTPSTATUS.OK)
          .json({ message: "Logged out successfully" });
      });
    });
  }
);
