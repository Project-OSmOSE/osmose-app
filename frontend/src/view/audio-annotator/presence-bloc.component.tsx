import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useAnnotationTagService } from "../../services/annotator/annotation-tag";
import { useTaskService } from "../../services/annotator/task";
import { DEFAULT_COLOR } from "../../consts/colors.const.tsx";
import { AnnotationMode } from "../../enum";
import { TagTooltip } from "./tag-tooltip.component.tsx";


export const PresenceBloc: React.FC = () => {
  const { context: taskCtx } = useTaskService();
  const { context: tagCtx, dispatch: tagDispatch } = useAnnotationTagService();

  if (taskCtx.currentTask?.annotationScope !== AnnotationMode.wholeFile) return <Fragment/>

  const onToggle = (tag: string) => {
    if (tagCtx.tags.includes(tag)) {
      //TODO:

    }
    tagDispatch!({
      type: tagCtx.tags.includes(tag) ? 'remove' : 'add',
      tag
    });
    // TODO: toggleGlobalTag
    //  - manage modal
    //  - save annotation ??
  }

  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { taskCtx.currentTask.annotationTags.map((tag, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => onToggle(tag) }
                     checked={ tagCtx.tags.includes(tag) }/>

              <OverlayTrigger overlay={ <TagTooltip id={ key }/> } placement="top">
                <label className="form-check-label" htmlFor={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                       style={ { color: taskCtx.tagColors.get(tag) ?? DEFAULT_COLOR } }>
                  { tag }
                </label>
              </OverlayTrigger>
            </li>
          )) }
        </ul>
      </div>
    </div>
  )
}