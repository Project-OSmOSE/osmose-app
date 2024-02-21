import React, { useContext } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { AnnotationMode } from "../../../../enum/annotation.enum.tsx";
import { DEFAULT_COLOR } from "../../../../consts/colors.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import {
  AnnotationsContext, AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";


export const TagListBloc: React.FC = () => {

  const context = useContext(AnnotationsContext);

  return (
    <div className="card">
      <h6 className="card-header text-center">Tags list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-tags">
          { context.allTags.map((tag, key) => (
            <TagItem tag={ tag }
                     key={ key }
                     id={ key }
                     isEnabled={ context.presenceTags.includes(tag) }
                     isActive={ context.focusedTag === tag }></TagItem>
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

  const context = useContext(AnnotationsContext);
  const dispatch = useContext(AnnotationsContextDispatch);

  const color = context.tagColors.get(tag) ?? DEFAULT_COLOR;
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
                onClick={ () => dispatch!({ type: 'focusTag', tag }) }
                type="button"
                disabled={ context.currentMode === AnnotationMode.wholeFile ? !isEnabled : false }>
          { tag }
        </button>
      </li>
    </OverlayTrigger>
  )
}
