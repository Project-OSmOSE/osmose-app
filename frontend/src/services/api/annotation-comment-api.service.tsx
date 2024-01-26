import { useEffect, useMemo } from "react";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";

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

export class AnnotationCommentAPIService extends APIService<never, never, CreateResult> {

  public create(data: Create): Promise<CreateResult> {
    return super.create(
      data,
      `${ this.URI }/${ data.comment_id ?? "" }`
    )
  }

  abort() {
    super.abort();
  }
}

export const useAnnotationCommentAPI = () => {
  const { context, catch401 } = useAuthService();
  const service = useMemo(() => new AnnotationCommentAPIService('/api/annotation-comment', catch401), [catch401]);

  useEffect(() => {
    service.auth = context;
  }, [context, service])

  return service;
}
