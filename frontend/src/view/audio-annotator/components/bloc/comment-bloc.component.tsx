import React, { Fragment } from "react";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";
import { DEFAULT_COMMENT } from "../../../../services/annotator/annotator.context.tsx";



export const CommentBloc: React.FC = () => {
  const {
    context,
    shortcuts,
    comments,
  } = useAnnotatorService();

  if (!context.task) return <Fragment/>;
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
                      value={ context.comments.focus?.comment }
                      onChange={ e => comments.update({
                        ...context.comments.focus ?? DEFAULT_COMMENT,
                        comment: e.target.value
                      }) }
                      onFocus={ shortcuts.disable }
                      onBlur={ shortcuts.enable }></textarea>
            <div className="input-group-append col-sm-2 p-0">
              <div className="btn-group-vertical">
                <button className="btn btn-submit" onClick={ comments.saveFocusComment }>
                  <i className="fas fa-check"></i>
                </button>
                <button className="btn btn-danger ml-0"
                        onClick={ () => comments.update({
                          ...context.comments.focus ?? DEFAULT_COMMENT,
                          comment: ""
                        }) }>
                  <i className="fas fa-broom"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className={ `btn w-100 ${ context.comments.focus?.annotation_result === null ? "isActive" : "" }` }
                onClick={ comments.focusTaskComment }>
          Task Comment { context.comments.taskComment.comment !== "" ? <i className="fas fa-comment mx-2"></i> :
          <i className="far fa-comment mr-2"></i> }
        </button>
      </div>
    </div>
  )
}