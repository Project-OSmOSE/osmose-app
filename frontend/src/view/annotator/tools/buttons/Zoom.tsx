import React, { Fragment, useMemo } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useRetrieveAnnotatorQuery, zoom } from '@/service/annotator';
import { MdZoomIn, MdZoomOut } from "react-icons/md";
import styles from '../annotator-tools.module.scss'
import { useParams } from "react-router-dom";

export const ZoomButton: React.FC = () => {
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery(params)

  const {
    zoomLevel,
    spectrogramConfigurationID
  } = useAppSelector(state => state.annotator.userPreferences);
  const dispatch = useAppDispatch()

  const currentConfiguration = useMemo(() => data?.spectrogram_configurations.find(c => c.id === spectrogramConfigurationID), [ data?.spectrogram_configurations, spectrogramConfigurationID ]);

  function zoomIn() {
    dispatch(zoom({ direction: 'in' }))
  }

  function zoomOut() {
    dispatch(zoom({ direction: 'out' }))
  }

  return <Fragment>
    <MdZoomOut className={ [styles.zoom, zoomLevel > 1 ? '' : styles.disabled].join(' ') }
               onClick={ zoomOut }/>
    <MdZoomIn className={ [styles.zoom, zoomLevel < (currentConfiguration?.zoom_level ?? 0) ? '' : styles.disabled].join(' ') }
              onClick={ zoomIn }/>
    <p>{ zoomLevel }x</p>
  </Fragment>
}