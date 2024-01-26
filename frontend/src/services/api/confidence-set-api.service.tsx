import { useEffect, useMemo } from "react";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";


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

class ConfidenceSetAPIService extends APIService<List, never, never>{}

export const useConfidenceSetAPI = () => {
  const {context, catch401} = useAuthService();

  const service = useMemo(() => new ConfidenceSetAPIService('/api/confidence-indicator', catch401), [catch401]);

  useEffect(() => {
    service.auth = context;
  }, [context, service])
  return service;
}