import React, { ChangeEvent, Fragment, MutableRefObject } from "react";
import { useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";

const AVAILABLE_RATES: Array<number> = [ 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0 ];


export const PlaybackRateSelect: React.FC<{ player: MutableRefObject<HTMLAudioElement | null> }> = ({ player }) => {

  const audioSpeed = useAppSelector(state => state.annotator.userPreferences.audioSpeed);

  const audioService = useAudioService(player)

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    audioService.setAudioSpeed(+e.target.value)
  }

  if (!player || !player.current?.preservesPitch) return <Fragment/>
  return <select className="form-control select-rate"
                 defaultValue={ audioSpeed }
                 onChange={ onSelect }>
    { AVAILABLE_RATES.map(rate => (
      <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
    )) }
  </select>
}