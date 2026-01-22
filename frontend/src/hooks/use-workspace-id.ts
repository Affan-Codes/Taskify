import { useParams } from "react-router";

const useWorkspaceId = () => {
  const params = useParams();
  return params.workspaceId as string;
};

export default useWorkspaceId;

// Complete
