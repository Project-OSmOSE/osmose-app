import React, { Fragment, useContext, useImperativeHandle } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { AnnotationMode } from "../../../../enum/annotation.enum.tsx";
import { DEFAULT_COLOR } from "../../../../consts/colors.const.tsx";
import { AlphanumericKeys } from "../../../../consts/shorcuts.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import { confirm } from "../../../global-components";
import { KeypressHandler } from "../../audio-annotator.page.tsx";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";
import { AnnotatorContext, AnnotatorDispatchContext } from "../../../../services/annotator/annotator.context.tsx";


export const PresenceBloc = React.forwardRef<KeypressHandler, any>((_, ref) => {

  const context = useContext(AnnotationsContext);
  const dispatch = useContext(AnnotationsContextDispatch);

  const annotatorContext = useContext(AnnotatorContext);
  const annotatorDispatch = useContext(AnnotatorDispatchContext);

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!annotatorContext.areShortcutsEnabled) return;
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, context.allTags.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    for (const i in active_alphanumeric_keys) {
      if (event.key !== AlphanumericKeys[0][i] && event.key !== AlphanumericKeys[1][i]) continue;

      const calledTag = context.allTags[i];
      if (context.presenceTags.includes(calledTag) && context.focusedTag !== calledTag) {
        dispatch!({ type: 'focusTag', tag: calledTag })
      } else toggle(calledTag);
    }
  }

  useImperativeHandle(ref, () => ({ handleKeyPressed }));

  const toggle = async (tag: string) => {
    if (context.presenceTags.includes(tag)) {
      // Remove presence
      if (context.results.find(a => a.annotation === tag)) {
        // if annotations exists with this tag: wait for confirmation
        annotatorDispatch!({ type: 'disableShortcuts' })
        const response = await confirm(`You are about to remove ${context.results.filter(r => r.annotation === tag).length} annotations using "${tag}" label. Are you sure ?`, `Remove "${tag}" annotations`);
        annotatorDispatch!({ type: 'enableShortcuts' })
        if (!response) return;
      }
      dispatch!({ type: 'removePresence', tag })
    } else {
      // Add presence
      dispatch!({ type: 'addPresence', tag })
    }
  }

  if (context.currentMode !== AnnotationMode.wholeFile) return <Fragment/>;
  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { context.allTags.map((tag, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => toggle(tag) }
                     checked={ context.presenceTags.includes(tag) }/>

              <OverlayTrigger overlay={ <Tooltip><TooltipComponent id={ key }/></Tooltip> } placement="top">
                <label className="form-check-label" htmlFor={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                       style={ { color: context.tagColors.get(tag) ?? DEFAULT_COLOR } }>
                  { tag }
                </label>
              </OverlayTrigger>
            </li>
          )) }
        </ul>
      </div>
    </div>
  )
})
