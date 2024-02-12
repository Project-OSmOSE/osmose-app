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


  list(): Promise<never> {
    throw 'Unimplemented';
  }

  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useAnnotationCommentAPI = () => {
  const auth = useAuthService();
  return new AnnotationCommentAPIService('/api/annotation-comment', auth);
}
