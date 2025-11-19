import { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
    }

    interface Request {
      session: Session & {
        oauthState?: string;
      };
    }
  }
}

declare module "express-session" {
  interface SessionData {
    oauthState?: string;
  }
}
