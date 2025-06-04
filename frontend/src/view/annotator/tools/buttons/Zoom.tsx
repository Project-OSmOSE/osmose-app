import React, { Fragment } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { MdZoomIn, MdZoomOut } from "react-icons/md";
import styles from '../annotator-tools.module.scss'
import { useCurrentConfiguration } from '@/service/annotator/spectrogram';
import { AnnotatorSlice } from "@/service/slices/annotator.ts";

export const ZoomButton: React.FC = () => {

  const {
    zoomLevel,
  } = useAppSelector(state => state.annotator.userPreferences);
  const dispatch = useAppDispatch()

  const currentConfiguration = useCurrentConfiguration();

  function zoomIn() {
    dispatch(AnnotatorSlice.actions.zoom({ direction: 'in' }))
  }

  function zoomOut() {
    dispatch(AnnotatorSlice.actions.zoom({ direction: 'out' }))
  }

  return <Fragment>
    <MdZoomOut className={ [ styles.zoom, zoomLevel > 1 ? '' : styles.disabled ].join(' ') }
               onClick={ zoomOut }/>
    <MdZoomIn
      className={ [ styles.zoom, (zoomLevel * 2) <= (2 ** ((currentConfiguration?.zoom_level ?? 1) - 1)) ? '' : styles.disabled ].join(' ') }
      onClick={ zoomIn }/>
    <p>{ zoomLevel }x</p>
  </Fragment>
}