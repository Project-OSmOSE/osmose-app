import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { AnnotationMode } from "@/types/annotations.ts";
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { focusTag } from "@/slices/annotator/annotations.ts";


export const TagListBloc: React.FC = () => {

  const {
    allTags,
    presenceTags,
    focusedTag
  } = useAppSelector(state => state.annotator.annotations);

  return (
    <div className="card">
      <h6 className="card-header text-center">Tags list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-tags">
          { allTags.map((tag, key) => (
            <TagItem tag={ tag }
                     key={ key }
                     id={ key }
                     isEnabled={ presenceTags.includes(tag) }
                     isActive={ focusedTag === tag }></TagItem>
          )) }
        </ul>
      </div>
    </div>
  )
}

interface ItemProps {
  tag: string,
  id: number,
  isEnabled: boolean,
  isActive: boolean,
}

const TagItem: React.FC<ItemProps> = ({
                                        tag,
                                        id,
                                        isEnabled,
                                        isActive,
                                      }) => {

  const {
    tagColors,
    currentMode
  } = useAppSelector(state => state.annotator.annotations);
  const dispatch = useAppDispatch()

  const color = tagColors[tag] ?? DEFAULT_COLOR;
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
    <OverlayTrigger overlay={ <Tooltip hidden={ !isEnabled }><TooltipComponent id={ id }/></Tooltip> } placement="top">
      <li>
        <button className={ isEnabled ? `btn pulse__${ id }--active` : 'btn' }
                style={ isActive ? style.active : style.inactive }
                onClick={ () => dispatch(focusTag(tag)) }
                type="button"
                disabled={ currentMode === AnnotationMode.wholeFile ? !isEnabled : false }>
          { tag }
        </button>
      </li>
    </OverlayTrigger>
  )
}
