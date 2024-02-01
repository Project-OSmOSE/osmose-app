import React, { useContext } from "react";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";
import { AnnotatorDispatchContext } from "../../../../services/annotator/annotator.context.tsx";


export const CommentBloc: React.FC = () => {

  const context = useContext(AnnotationsContext);
  const dispatch = useContext(AnnotationsContextDispatch);

  const annotatorDispatch = useContext(AnnotatorDispatchContext);

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
                      value={ context.focusedComment?.comment ?? '' }
                      onChange={ e => dispatch!({ type: 'updateFocusComment', comment: e.target.value }) }
                      onFocus={ () => annotatorDispatch!({ type: 'disableShortcuts'}) }
                      onBlur={ () => annotatorDispatch!({ type: 'enableShortcuts'}) }></textarea>
            <div className="input-group-append col-sm-2 p-0">
              <div className="btn-group-vertical">
                <button className="btn btn-danger ml-0"
                        onClick={ () => dispatch!({ type: 'removeFocusComment' }) }>
                  <i className="fas fa-broom"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className={ `btn w-100 ${ !context.focusedResult ? "isActive" : "" }` }
                onClick={ () => dispatch!({ type: 'focusTask' }) }>
          Task Comment { context.taskComment.comment ? <i className="fas fa-comment mx-2"></i> :
          <i className="far fa-comment mr-2"></i> }
        </button>
      </div>
    </div>
  )
}