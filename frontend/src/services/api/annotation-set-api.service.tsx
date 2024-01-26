import { useEffect, useMemo } from "react";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  tags: Array<string>;
}

export const useAnnotationSetAPI = () => {
  const { context, catch401 } = useAuthService();

  const service = useMemo(() => new APIService<List, never, never>('/api/annotation-set', catch401), [catch401]);

  useEffect(() => {
    service.auth = context;
  }, [context, service])

  return service;
}