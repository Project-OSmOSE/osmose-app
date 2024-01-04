import React from "react";

export type Comment = {
  id?: number,
  comment: string,
  annotation_task: number,
  annotation_result: number | null,
};

interface Props {
  currentComment: Comment,
  taskComment: Comment,
  onCommentUpdated: (comment: Comment) => void,
  onFocusUpdated: (isFocused: boolean) => void,
  onSubmit: () => void,
  switchToTaskComment: () => void
}

export const CommentBloc: React.FC<Props> = ({
                                               currentComment,
                                               taskComment,
                                               onCommentUpdated,
                                               onFocusUpdated,
                                               onSubmit,
                                               switchToTaskComment
                                             }) => {

  return (
    <div className="col-sm-2">
      <div className="card">
        <h6 className="card-header text-center">Comments</h6>
        <div className="card-body">
          <div className="row m-2">
            <textarea key="textAreaComments" id="commentInput" className="col-sm-10 comments"
                      maxLength={ 255 }
                      rows={ 10 }
                      cols={ 10 }
                      value={ currentComment.comment }
                      onChange={ e => onCommentUpdated({
                        ...currentComment,
                        comment: e.target.value
                      }) }
                      onFocus={ () => onFocusUpdated(true) }
                      onBlur={ () => onFocusUpdated(false) }></textarea>
            <div className="input-group-append col-sm-2 p-0">
              <div className="btn-group-vertical">
                <button className="btn btn-submit" onClick={ onSubmit }>
                  <i className="fas fa-check"></i>
                </button>
                <button className="btn btn-danger ml-0"
                        onClick={ () => onCommentUpdated({
                          ...currentComment,
                          comment: ""
                        }) }>
                  <i className="fas fa-broom"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className={ `btn w-100 ${ currentComment.annotation_result === null ? "isActive" : "" }` }
                onClick={ switchToTaskComment }>
          Task Comment { taskComment.comment !== "" ? <i className="fas fa-comment mx-2"></i> :
          <i className="far fa-comment mr-2"></i> }
        </button>
      </div>
    </div>
  )
}