import React, { Fragment, useImperativeHandle } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { AnnotationMode } from "@/types/annotations.ts";
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import { AlphanumericKeys } from "@/consts/shorcuts.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import { confirm } from "@/view/global-components";
import { KeypressHandler } from "../../audio-annotator.page.tsx";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { disableShortcuts, enableShortcuts } from "@/slices/annotator/global-annotator.ts";
import { addPresence, focusTag, removePresence } from "@/slices/annotator/annotations.ts";


export const PresenceBloc = React.forwardRef<KeypressHandler, any>((_, ref) => {

  const {
    areShortcutsEnabled,
  } = useAppSelector(state => state.annotator.global);
  const {
    allTags,
    presenceTags,
    focusedTag,
    results,
    currentMode,
    tagColors
  } = useAppSelector(state => state.annotator.annotations);
  const dispatch = useAppDispatch()

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!areShortcutsEnabled) return;
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, allTags.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    for (const i in active_alphanumeric_keys) {
      if (event.key !== AlphanumericKeys[0][i] && event.key !== AlphanumericKeys[1][i]) continue;

      const calledTag = allTags[i];
      if (presenceTags.includes(calledTag) && focusedTag !== calledTag) {
        dispatch(focusTag(calledTag))
      } else toggle(calledTag);
    }
  }

  useImperativeHandle(ref, () => ({ handleKeyPressed }));

  const toggle = async (tag: string) => {
    if (presenceTags.includes(tag)) {
      // Remove presence
      if (results.find(a => a.annotation === tag)) {
        // if annotations exists with this tag: wait for confirmation
        dispatch(disableShortcuts())
        const response = await confirm(`You are about to remove ${results.filter(r => r.annotation === tag).length} annotations using "${tag}" label. Are you sure ?`, `Remove "${tag}" annotations`);
        dispatch(enableShortcuts())
        if (!response) return;
      }
      dispatch(removePresence(tag));
    } else {
      // Add presence
      dispatch(addPresence(tag));
    }
  }

  if (currentMode !== AnnotationMode.wholeFile) return <Fragment/>;
  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { allTags.map((tag, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => toggle(tag) }
                     checked={ presenceTags.includes(tag) }/>

              <OverlayTrigger overlay={ <Tooltip><TooltipComponent id={ key }/></Tooltip> } placement="top">
                <label className="form-check-label" htmlFor={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                       style={ { color: tagColors[tag] ?? DEFAULT_COLOR } }>
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
