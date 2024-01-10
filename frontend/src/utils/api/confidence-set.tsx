import { APIService } from "../requests.tsx";
import { useAuth, useAuthDispatch } from "../auth.tsx";
import { useEffect } from "react";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  confidenceIndicators: Array<{
    id: number;
    label: string;
    level: number;
    isDefault: boolean;
  }>;
}

export const useConfidenceSetAPI = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    service.setAuth(auth)
  }, [auth])

  const service = new class ConfidenceSetAPIService extends APIService<List, never, never>{
    URI = '/api/confidence-indicator';
  }(auth, authDispatch!);

  return service;
}