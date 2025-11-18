import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { isAuthenticated } from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import mongoose from "mongoose";

const app = express();

const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

const startServer = async () => {
  try {
    await connectDatabase();
    console.log("✅ Database connected");

    app.use(
      session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient() as any,
          collectionName: "sessions",
          ttl: 24 * 60 * 60,
          autoRemove: "native",
          touchAfter: 24 * 3600,
          crypto: {
            secret: config.SESSION_SECRET,
          },
        }),
        cookie: {
          maxAge: 24 * 60 * 60 * 1000,
          secure: config.NODE_ENV === "production",
          httpOnly: true,
          sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
        },
        name: "sid",
      })
    );
    console.log("✅ Session store configured");

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json({ message: "Hey there" });
    });

    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
    app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
    app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
    app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
    app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

    app.use(errorHandler);

    app.listen(config.PORT, () => {
      console.log(
        `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
      console.log(`📊 Session store: MongoDB Atlas`);
      console.log(`🔒 Session encryption: Enabled`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
