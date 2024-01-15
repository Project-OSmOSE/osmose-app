import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TagTooltip } from "./tag-tooltip.component.tsx";
import { useAnnotationTagService } from "../../services/annotator/annotation-tag";
import { useTaskService } from "../../services/annotator/task";
import { AnnotationMode } from "../../enum";
import { DEFAULT_COLOR } from "../../consts/colors.const.tsx";


export const TagListBloc: React.FC = () => {
  const { context } = useTaskService();
  return (
    <div className="card">
      <h6 className="card-header text-center">Tags list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-tags">
          { context.currentTask?.annotationTags.map((tag, key) => (
            <TagItem tag={ tag }
                     key={ key }/>
          )) }
        </ul>
      </div>
    </div>
  )
}

interface ItemProps {
  tag: string,
  key: number,
}

const TagItem: React.FC<ItemProps> = ({
                                        tag,
                                        key,
                                      }) => {
  const { context: taskCtx } = useTaskService();
  const { context: tagCtx, dispatch: tagDispatch } = useAnnotationTagService();

  const color = taskCtx.tagColors.get(tag) ?? DEFAULT_COLOR;
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

  const isEnabled = tagCtx.tags.includes(tag);

  return (
    <OverlayTrigger overlay={ <TagTooltip id={ key } hide={ !isEnabled }></TagTooltip> }
                    key={ `tag-overlay-${ key.toString() }` }
                    placement="top">
      <li key={ `tag-${ key.toString() }` }>
        <button id={ `tags_key_shortcuts_${ key.toString() }` }
                className={ isEnabled ? `btn pulse__${ key }--active` : 'btn' }
                style={ tagCtx.focused === tag ? style.active : style.inactive }
                onClick={ () => tagDispatch!({
                  type: 'focus',
                  tag
                }) }
                type="button"
                disabled={ taskCtx.currentTask?.annotationScope === AnnotationMode.wholeFile ? !isEnabled : false }>
          { tag }
        </button>
      </li>
    </OverlayTrigger>
  )
}