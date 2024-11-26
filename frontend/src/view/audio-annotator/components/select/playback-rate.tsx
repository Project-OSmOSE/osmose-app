import React, { ChangeEvent, Fragment, MutableRefObject } from "react";
import { useAppSelector } from "@/slices/app.ts";
import { useAudioService } from "@/services/annotator/audio.service.ts";

const AVAILABLE_RATES: Array<number> = [ 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0 ];


export const PlaybackRateSelect: React.FC<{ player: MutableRefObject<HTMLAudioElement | null> }> = ({ player }) => {

  const {
    playbackRate
  } = useAppSelector(state => state.annotator.audio);

  const audioService = useAudioService(player)

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    audioService.setPlaybackRate(+e.target.value)
  }

  if (!player || !player.current?.preservesPitch) return <Fragment/>
  return <select className="form-control select-rate"
                 defaultValue={ playbackRate }
                 onChange={ onSelect }>
    { AVAILABLE_RATES.map(rate => (
      <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
    )) }
  </select>
}