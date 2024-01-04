import { SuperAgentRequest, post, put } from "superagent";
import { ApiServiceParent } from "./ApiService.parent.tsx";
import { Comment } from "../../AudioAnnotator/bloc/CommentBloc.tsx";


export class AnnotationCommentsApiService extends ApiServiceParent {
  public static shared: AnnotationCommentsApiService = new AnnotationCommentsApiService();
  private URI = '/api/annotation-comment';

  private createRequest?: SuperAgentRequest;
  private updateRequest?: SuperAgentRequest;

  public createOrUpdate(comment: Comment): Promise<Comment & { delete: any }> {
    if (comment.id) return this.update(comment);
    return this.create(comment);
  }

  public async create(comment: Comment): Promise<Comment & { delete: any }> {
    this.createRequest = post(this.URI);
    const response = await this.doRequest(this.createRequest.send({
      comment: comment.comment,
      annotation_task_id: comment.annotation_task,
      annotation_result_id: comment.annotation_result,
      comment_id: comment.id,
    }));
    return response.body
  }

  public async update(comment: Comment): Promise<Comment & { delete: any }> {
    this.createRequest = put(`${ this.URI }/${comment.id}`);
    const response = await this.doRequest(this.createRequest.send({
      comment: comment.comment,
      annotation_task_id: comment.annotation_task,
      annotation_result_id: comment.annotation_result,
      comment_id: comment.id,
    }));
    return response.body
  }

  public abortRequests(): void {
    this.createRequest?.abort()
    this.updateRequest?.abort()
  }
}