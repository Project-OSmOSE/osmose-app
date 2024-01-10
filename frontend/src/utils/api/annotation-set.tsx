import { APIService } from "../requests.tsx";
import { useAuth, useAuthDispatch } from "../auth.tsx";
import { useEffect } from "react";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  tags: Array<string>;
}

export const useAnnotationSetAPI = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    service.setAuth(auth)
  }, [auth])

  const service = new class AnnotationSetAPIService extends APIService<List, never, never>{
    URI = '/api/annotation-set';
  }(auth, authDispatch!);

  return service;
}