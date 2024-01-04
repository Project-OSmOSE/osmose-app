import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { AnnotationMode } from "../../services/API/ApiService.data.tsx";
import { getTagColor } from "../../utils.tsx";
import { Tooltip } from "./Tooltip.tsx";

interface Props {
  tags: Array<string>,
  tagColors: Map<string, string>,
  selectedTags: Array<string>,
  activeTag: string,
  annotationMode: AnnotationMode,
  onTagSelected: (tag: string) => void;
}

export const TagListBloc: React.FC<Props> = ({
                                               tags,
                                               tagColors,
                                               selectedTags,
                                               activeTag,
                                               annotationMode,
                                               onTagSelected
                                             }) => {
  return (
    <div className="card">
      <h6 className="card-header text-center">Tags list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-tags">
          { tags.map((tag, key) => (
            <TagItem tag={ tag }
                     tagColors={ tagColors }
                     mode={ annotationMode }
                     key={ key }
                     isEnabled={ selectedTags.includes(tag) }
                     isActive={ activeTag.includes(tag) }
                     onTagSelected={onTagSelected}
            ></TagItem>
          )) }
        </ul>
      </div>
    </div>
  )
}

interface ItemProps {
  tag: string,
  tagColors: Map<string, string>,
  key: number,
  mode: AnnotationMode,
  isEnabled: boolean,
  isActive: boolean,
  onTagSelected: (tag: string) => void;
}

const TagItem: React.FC<ItemProps> = ({
                                        tag,
                                        key,
                                        mode,
                                        isEnabled,
                                        isActive,
                                        tagColors,
                                        onTagSelected
                                      }) => {
  const color = getTagColor(tagColors, tag);
  const style = {
    inactive: {
      backgroundColor: color,
      border: 'none',
      color: '#ffffff',
    },
    active: {
      backgroundColor: 'transparent',
      border: `1px solid ${ color }`,
      color: color,
    },
  };

  return (
    <OverlayTrigger overlay={ <Tooltip id={ key } hide={ !isEnabled }></Tooltip> }
                    key={ `tag-overlay-${ key.toString() }` }
                    placement="top">
      <li key={ `tag-${ key.toString() }` }>
        <button id={ `tags_key_shortcuts_${ key.toString() }` }
                className={ isEnabled ? `btn pulse__${ key }--active` : 'btn' }
                style={ isActive ? style.active : style.inactive }
                onClick={ () => onTagSelected(tag) }
                type="button"
                disabled={ mode === AnnotationMode.wholeFile ? !isEnabled : false }>
          { tag }
        </button>
      </li>
    </OverlayTrigger>
  )
}