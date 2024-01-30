import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";
import { AnnotationMode } from "../../../../enum/annotation.enum.tsx";
import { DEFAULT_COLOR } from "../../../../consts/colors.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";


export const TagListBloc: React.FC = () => {
  const { context } = useAnnotatorService();
  if (!context.task) return <Fragment/>;
  return (
    <div className="card">
      <h6 className="card-header text-center">Tags list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-tags">
          { context.task?.annotationTags.map((tag, key) => (
            <TagItem tag={ tag }
                     key={ key }
                     id={ key }
                     isEnabled={ context.tags.array.includes(tag) }
                     isActive={ context.tags.focus === tag }></TagItem>
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
  const { context, tags } = useAnnotatorService();
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
                onClick={ () => tags.focus(tag) }
                type="button"
                disabled={ context.task?.annotationScope === AnnotationMode.wholeFile ? !isEnabled : false }>
          { tag }
        </button>
      </li>
    </OverlayTrigger>
  )
}