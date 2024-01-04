import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { getTagColor } from "../../utils.tsx";
import { Tooltip } from "./Tooltip.tsx";

interface Props {
  tags: Array<string>;
  tagsColors: Map<string, string>;
  selectedTags: Array<string>,
  onTagSelected: (tag: string) => void;
}

export const PresenceBloc: React.FC<Props> = ({ tags, tagsColors, selectedTags, onTagSelected }) => {

  return (
    <div className="card ml-2 flex-grow-1 mini-content">
      <h6 className="card-header text-center">Presence / Absence</h6>
      <div className="card-body">
        <ul className="presence-absence-columns">
          { tags.map((tag, key) => (
            <li className="form-check tooltip-wrap" key={ `tag-${ key.toString() }` }>
              <input id={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                     className="form-check-input"
                     type="checkbox"
                     onChange={ () => onTagSelected(tag) }
                     checked={ selectedTags.includes(tag) }/>

              <OverlayTrigger overlay={ <Tooltip id={key}></Tooltip> } placement="top">
                <label className="form-check-label" htmlFor={ `tags_key_checkbox_shortcuts_${ key.toString() }` }
                       style={ { color: getTagColor(tagsColors, tag) } }>
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