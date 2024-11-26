import React, { ChangeEvent } from "react";
import { SpectrogramActions } from "@/slices/annotator/spectro.ts";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { getScaleName } from "@/services/api/data/spectrogram.service.tsx";

export const SpectrogramConfigurationSelect: React.FC = () => {

  const {
    configurations,
    selectedID
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(SpectrogramActions.selectSpectrogram(+e.target.value))
  }

  return <select defaultValue={ selectedID }
                 onChange={ onSelect }>
    { configurations.map(spectrogram => (
      <option key={ spectrogram.id } value={ spectrogram.id }>
        nfft: { spectrogram.nfft } | winsize: { spectrogram.window_size } | overlap: { spectrogram.overlap } |
        scale: { getScaleName(spectrogram) }
      </option>
    ))
    }
  </select>
}