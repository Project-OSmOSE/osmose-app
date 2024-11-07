import React from "react";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { AnnotationActions } from "@/slices/annotator/annotations.ts";
import { AnnotatorActions } from "@/slices/annotator/global-annotator.ts";


export const CommentBloc: React.FC = () => {

  const dispatch = useAppDispatch();
  const {
    focusedComment,
    focusedResult,
    taskComments
  } = useAppSelector(state => state.annotator.annotations)

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
                      placeholder="Enter your comment"
                      value={ focusedComment?.comment ?? '' }
                      onChange={ e => dispatch(AnnotationActions.updateFocusComment(e.target.value)) }
                      onFocus={ () => dispatch(AnnotatorActions.disableShortcuts()) }
                      onBlur={ () => dispatch(AnnotatorActions.enableShortcuts()) }></textarea>
            <div className="input-group-append col-sm-2 p-0">
              <div className="btn-group-vertical">
                <button className="btn btn-danger ml-0"
                        onClick={ () => dispatch(AnnotationActions.removeFocusComment()) }>
                  <i className="fas fa-broom"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className={ `btn w-100 ${ !focusedResult ? "isActive" : "" }` }
                onClick={ () => dispatch(AnnotationActions.focusTask()) }>
          Task Comment { taskComments.length > 0 ? <i className="fas fa-comment mx-2"></i> :
          <i className="far fa-comment mr-2"></i> }
        </button>
      </div>
    </div>
  )
}
