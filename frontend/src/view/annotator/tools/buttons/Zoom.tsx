import React, { Fragment } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { zoom } from '@/service/annotator';
import { MdZoomIn, MdZoomOut } from "react-icons/md";
import styles from '../annotator-tools.module.scss'

export const ZoomButton: React.FC = () => {
  const zoomLevel = useAppSelector(state => state.annotator.userPreferences.zoomLevel);
  const dispatch = useAppDispatch()

  function zoomIn() {
    dispatch(zoom({ direction: 'in' }))
  }

  function zoomOut() {
    dispatch(zoom({ direction: 'out' }))
  }

  return <Fragment>
    <MdZoomOut className={ styles.zoom } onClick={ zoomOut }/>
    <MdZoomIn className={ styles.zoom } onClick={ zoomIn }/>
    <p>{ zoomLevel }x</p>
  </Fragment>
}