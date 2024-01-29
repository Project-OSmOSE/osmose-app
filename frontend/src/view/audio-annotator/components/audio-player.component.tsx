import React, { useEffect, useState } from 'react';
import { useAudioService } from "../../../services/annotator/audio";
import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player


export const AudioPlayer: React.FC = () => {
  const service = useAudioService();
  const { context: annotatorContext } = useAnnotatorService();
  const [isElementRegistered, setIsElementRegistered] = useState<boolean>(false)

  useEffect(() => {
    return () => {
      service.removeElement();
      service.onPause();
    }
  }, [])

  const setElement = (element: HTMLAudioElement) => {
    if (isElementRegistered) return;
    service.setElement(element, annotatorContext.task?.audioUrl);
    setIsElementRegistered(true);
  }

  // title property used to set lockscreen / process audio title on devices
  return (
    <audio autoPlay={ false }
           className="audio-player"
           controls={ false }
           loop={ false }
           muted={ false }
           ref={ setElement }
           onLoadedMetadata={ () => service.updateCurrentTime(0) }
           onAbort={ service.onPause.bind(service) }
           onEnded={ service.onPause.bind(service) }
           onPause={ service.onPause.bind(service) }
           onPlay={ service.onPlay.bind(service) }
           preload="auto"
           src={ annotatorContext.task?.audioUrl }
           title={ annotatorContext.task?.audioUrl }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
}
