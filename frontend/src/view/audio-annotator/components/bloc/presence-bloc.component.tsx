import React, { Fragment, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";
import { AnnotationMode } from "../../../../enum/annotation.enum.tsx";
import { DEFAULT_COLOR } from "../../../../consts/colors.const.tsx";
import { AlphanumericKeys } from "../../../../consts/shorcuts.const.tsx";

interface Props {
  onTagSelected: (tag: string) => void;
}

export const PresenceBloc: React.FC<Props> = ({ onTagSelected }) => {
  const { context, keyPressedSubject, tags } = useAnnotatorService();

  useEffect(() => {
    const sub = keyPressedSubject.subscribe(handleKeyPress);

    return () => {
      sub.unsubscribe();
    }
  }, [])

  const handleKeyPress = (event: KeyboardEvent) => {
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, context.task!.annotationTags.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    active_alphanumeric_keys.forEach((value, index) => {
      const tag = context.task!.annotationTags[index];

      if (event.key === value || event.key === AlphanumericKeys[1][index]) {
        tags.focus(context.task!.annotationTags[index])

        if (context.annotations.array.length === 0) {
          onTagSelected(tag);
          tags.add(tag);
          return;
        }
        if (context.tags.array.includes(tag)) {
          if (context.annotations.focus?.annotation === tag) {
            /** Delete all annotations and annotations TYPE_TAG */
            onTagSelected(tag);
          } else {
            //Change tag of this annotation
            tags.focus(tag);
          }
        } else {
          /** Create a new annotation TYPE_TAG */
          onTagSelected(tag);
        }
      }
    })
  }

  if (context.task?.annotationScope !== AnnotationMode.wholeFile) return <Fragment/>;
  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { context.task?.annotationTags.map((tag, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => onTagSelected(tag) }
                     checked={ context.tags.array.includes(tag) }/>

              <OverlayTrigger overlay={ <TooltipComponent id={key}></TooltipComponent> } placement="top">
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
}