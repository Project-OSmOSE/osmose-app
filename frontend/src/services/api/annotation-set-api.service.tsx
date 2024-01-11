import { useEffect } from "react";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  tags: Array<string>;
}

class AnnotationSetAPIService extends APIService<List, never, never>{}

export const useAnnotationSetAPI = () => {
  const {context, catch401} = useAuthService();

  useEffect(() => {
    service.auth = context;
  }, [context])

  const service = new AnnotationSetAPIService('/api/annotation-set', catch401);

  return service;
}