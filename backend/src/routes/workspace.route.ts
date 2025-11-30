import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMembersController,
  updateWorkspaceByIdController,
} from "../controllers/workspace.controller";
import { createResourceLimiter } from "../config/rateLimit.config";

const workspaceRoutes = Router();

workspaceRoutes.post(
  "/create/new",
  createResourceLimiter,
  createWorkspaceController
);

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);

workspaceRoutes.get("/:id", getWorkspaceByIdController);

workspaceRoutes.get("/members/:id", getWorkspaceMembersController);

workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

workspaceRoutes.put(
  "/change/member/role/:id",
  changeWorkspaceMemberRoleController
);

workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);

workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);

export default workspaceRoutes;
