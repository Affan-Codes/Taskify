import type { WorkspaceByIdResponseType } from "@/types/api.types";
import API from "../axios-client";

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);

  return response.data;
};
