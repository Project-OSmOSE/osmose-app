import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { AnnotationSet } from "@/types/label.ts";


export class AnnotationCommentAPIService extends APIService<Array<AnnotationSet>, never, never> {
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
