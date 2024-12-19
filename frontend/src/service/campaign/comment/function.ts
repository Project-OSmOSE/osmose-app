import { AnnotationComment, WriteAnnotationComment } from '@/service/campaign/comment/type.ts';

export function mapCommentForWriting(comment: AnnotationComment): WriteAnnotationComment {
  return {
    id: comment.id > -1 ? comment.id : undefined,
    comment: comment.comment
  }
}