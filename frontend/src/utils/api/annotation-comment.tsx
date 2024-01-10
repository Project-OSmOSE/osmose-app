import { APIService } from "../requests.tsx";
import { useAuth, useAuthDispatch } from "../auth.tsx";
import { useEffect } from "react";

export interface Create {
  comment_id?: number,
  comment: string,
  annotation_task_id: number,
  annotation_result_id: number | null,
}
export interface CreateResult {
  comment_id?: number,
  comment: string,
  annotation_task_id: number,
  annotation_result_id: number | null,
  delete?: any
}

export const useAnnotationCommentAPI = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    service.setAuth(auth)
  }, [auth])

  const service = new class AnnotationCommentAPIService extends APIService<never, never, CreateResult>{
    URI = '/api/annotation-comment';

    public create(data: Create): Promise<CreateResult> {
      return super.create(
        data,
        `${ this.URI }/${data.comment_id ?? ""}`
        )
    }

    abort() {
      super.abort();
    }
  }(auth, authDispatch!);

  return service;
}
