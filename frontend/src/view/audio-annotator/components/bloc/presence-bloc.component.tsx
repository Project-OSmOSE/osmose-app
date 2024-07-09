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
import { addPresence, focusLabel, removePresence } from "@/slices/annotator/annotations.ts";


export const PresenceBloc = React.forwardRef<KeypressHandler, any>((_, ref) => {

  const {
    areShortcutsEnabled,
  } = useAppSelector(state => state.annotator.global);
  const {
    allLabels,
    presenceLabels,
    focusedLabel,
    results,
    currentMode,
    labelColors
  } = useAppSelector(state => state.annotator.annotations);
  const dispatch = useAppDispatch()

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!areShortcutsEnabled) return;
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, allLabels.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    for (const i in active_alphanumeric_keys) {
      if (event.key !== AlphanumericKeys[0][i] && event.key !== AlphanumericKeys[1][i]) continue;

      const calledLabel = allLabels[i];
      if (presenceLabels.includes(calledLabel) && focusedLabel !== calledLabel) {
        dispatch(focusLabel(calledLabel))
      } else toggle(calledLabel);
    }
  }

  useImperativeHandle(ref,
    () => ({ handleKeyPressed }),
    [areShortcutsEnabled, allLabels]
  );

  const toggle = async (label: string) => {
    if (presenceLabels.includes(label)) {
      // Remove presence
      if (results.find(a => a.label === label)) {
        // if annotations exists with this label: wait for confirmation
        dispatch(disableShortcuts())
        const response = await confirm(`You are about to remove ${results.filter(r => r.label === label).length} annotations using "${label}" label. Are you sure ?`, `Remove "${label}" annotations`);
        dispatch(enableShortcuts())
        if (!response) return;
      }
      dispatch(removePresence(label));
    } else {
      // Add presence
      dispatch(addPresence(label));
    }
  }

  if (currentMode !== AnnotationMode.wholeFile) return <Fragment/>;
  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { allLabels.map((label, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => toggle(label) }
                     checked={ presenceLabels.includes(label) }/>

              <OverlayTrigger overlay={ <Tooltip><TooltipComponent id={ key }/></Tooltip> } placement="top">
                <label className="form-check-label" htmlFor={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                       style={ { color: labelColors[label] ?? DEFAULT_COLOR } }>
                  { label }
                </label>
              </OverlayTrigger>
            </li>
          )) }
        </ul>
      </div>
    </div>
  )
})
