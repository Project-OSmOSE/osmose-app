import { APIService } from "../requests.tsx";
import { useEffect } from "react";
import { useAuthService } from "../../../services/auth/auth.service.tsx";

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
  const {context, dispatch} = useAuthService();

  useEffect(() => {
    service.setAuth(context)
  }, [context])

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
  }(context, dispatch!);

  return service;
}
