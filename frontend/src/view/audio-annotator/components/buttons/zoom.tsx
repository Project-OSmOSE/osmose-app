import React, { Fragment } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { zoom } from '@/service/annotator';

export const ZoomButton: React.FC = () => {
  const zoomLevel = useAppSelector(state => state.annotator.userPreferences.zoomLevel);
  const dispatch = useAppDispatch()

  return <Fragment>
    <button className="btn-simple fa fa-search-plus"
            onClick={ () => dispatch(zoom({ direction: 'in' })) }></button>
    <button className="btn-simple fa fa-search-minus"
            onClick={ () => dispatch(zoom({ direction: 'out' })) }></button>
    <span>{ zoomLevel }x</span>
  </Fragment>
}