import React, { Fragment, useEffect, useState } from 'react';
import { AudioPlayStatus } from "../../enum";
import { useAudioService } from "../../services/annotator/audio";
import { useTaskService } from "../../services/annotator/task";

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player


export const AudioPlayer: React.FC = () => {
  const [timeUpdateInterval, setTimeUpdateInterval] = useState<any>();

  const { context: taskContext } = useTaskService();
  const { context, dispatch } = useAudioService();


  useEffect(() => {
    return () => {
      _clearListenTrack();
    }
  }, [])

  useEffect(() => {
    if (!context.element) return;

    context.element.volume = 1.0;
    // Do not preserve pitch when changing playback rate
    context.element.preservesPitch = false;
    context.element.playbackRate = 1.0;
  }, [context.element])

  //TODO
  // useEffect(() => {
  //   if (!taskContext.playedAnnotation) return;
  //   if (!context.element) return;
  //   context.element.currentTime = taskContext.playedAnnotation.startTime;
  //   context.element.play();
  // }, [taskContext.playedAnnotation])

  if (!dispatch || !taskContext.currentTask?.audioUrl) return <Fragment/>

  const setElement = (e: HTMLAudioElement | null) => {
    dispatch({
      type: 'element',
      element: e ?? undefined
    });
  }

  /**
   * Clear the onListen interval
   */
  const _clearListenTrack = () => {
    if (!timeUpdateInterval) return;
    clearInterval(timeUpdateInterval);
    setTimeUpdateInterval(null);
  }

  /**
   * Set an interval to call props.onListen every listenInterval time period
   */
  const _setListenTrack = () => {
    if (timeUpdateInterval) return;
    const listenInterval = 10;
    setTimeUpdateInterval(setInterval(() => {
      dispatch({
        type: 'time',
        newTime: context.element?.currentTime
      })
      //TODO
      // if (!taskContext.playedAnnotation?.endTime || !context.element?.currentTime) return;
      // if (context.element?.currentTime > taskContext.playedAnnotation.endTime) return _onPause();
    }, listenInterval));
  }

  const _onPause = () => {
    // When the user pauses playback
    _clearListenTrack();
    dispatch({
      type: "state",
      newState: AudioPlayStatus.pause
    })
  }

  const _onPlay = () => {
    // When audio play starts
    _setListenTrack();
    dispatch({
      type: "state",
      newState: AudioPlayStatus.play
    })
  }

  const _onLoadedMetadata = () => {
    dispatch({
      type: "time",
      newTime: 0
    })
  }


  return <audio src={ taskContext.currentTask.audioUrl }
                title={ taskContext.currentTask.audioUrl }
                ref={ setElement }
                preload="auto"
                onAbort={ _onPause }
                onPause={ _onPause }
                onEnded={ _onPause }
                onPlay={ _onPlay }
                onLoadedMetadata={ _onLoadedMetadata }
                autoPlay={ false }
                className="audio-player"
                controls={ false }
                loop={ false }
                muted={ false }>
    <p>Your browser does not support the <code>audio</code> element.</p>
  </audio>
}

