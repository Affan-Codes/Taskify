import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryFn } from "../../lib/api/auth.api";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    retry: 2,
  });

  return query;
};

export default useAuth;
