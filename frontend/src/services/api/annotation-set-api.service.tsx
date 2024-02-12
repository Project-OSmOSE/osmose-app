import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  tags: Array<string>;
}

export class AnnotationCommentAPIService extends APIService<List, never, never> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}


export const useAnnotationSetAPI = () => {
  const auth = useAuthService();
  return new AnnotationCommentAPIService('/api/annotation-set', auth);
}
