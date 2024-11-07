import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { TooltipComponent } from "../tooltip.component.tsx";
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { AnnotationActions } from "@/slices/annotator/annotations.ts";


export const LabelListBloc: React.FC = () => {

  const {
    labelSet,
    presenceLabels,
    focusedLabel
  } = useAppSelector(state => state.annotator.annotations);

  return (
    <div className="card">
      <h6 className="card-header text-center">Labels list</h6>
      <div className="card-body d-flex justify-content-between">
        <ul className="card-text annotation-labels">
          { labelSet?.labels.map((label, key) => (
            <LabelItem label={ label }
                       key={ key }
                       id={ key }
                       isEnabled={ presenceLabels.includes(label) }
                       isActive={ focusedLabel === label }></LabelItem>
          )) }
        </ul>
      </div>
    </div>
  )
}

interface ItemProps {
  label: string,
  id: number,
  isEnabled: boolean,
  isActive: boolean,
}

const LabelItem: React.FC<ItemProps> = ({
                                          label,
                                          id,
                                          isEnabled,
                                          isActive,
                                        }) => {

  const {
    labelColors
  } = useAppSelector(state => state.annotator.annotations);
  const dispatch = useAppDispatch()

  const color = labelColors[label] ?? DEFAULT_COLOR;
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
                style={ isActive ? style.active : (isEnabled ? style.inactive : {}) }
                onClick={ () => dispatch(AnnotationActions.focusLabel(label)) }
                type="button"
                disabled={ !isEnabled }>
          { label }
        </button>
      </li>
    </OverlayTrigger>
  )
}
