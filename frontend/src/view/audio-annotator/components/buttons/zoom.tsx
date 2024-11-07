import React, { Fragment } from "react";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { SpectrogramActions } from "@/slices/annotator/spectro.ts";

export const ZoomButton: React.FC = () => {
  const {
    currentZoom
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  return <Fragment>
    <button className="btn-simple fa fa-search-plus"
            onClick={ () => dispatch(SpectrogramActions.zoom({ direction: 'in' })) }></button>
    <button className="btn-simple fa fa-search-minus"
            onClick={ () => dispatch(SpectrogramActions.zoom({ direction: 'out' })) }></button>
    <span>{ currentZoom }x</span>
  </Fragment>
}