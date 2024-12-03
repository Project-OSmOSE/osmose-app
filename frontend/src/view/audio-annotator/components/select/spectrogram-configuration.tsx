import React, { ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { getScaleName } from '@/service/dataset/spectrogram-configuration';
import { selectSpectrogramConfiguration } from '@/service/annotator';

export const SpectrogramConfigurationSelect: React.FC = () => {
  const spectrogramConfigurationID = useAppSelector(state => state.annotator.userPreferences.spectrogramConfigurationID);
  const spectrogramConfigurations = useAppSelector(state => state.annotator.spectrogram_configurations);

  const dispatch = useAppDispatch()

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectSpectrogramConfiguration(+e.target.value))
  }

  return <select defaultValue={ spectrogramConfigurationID }
                 onChange={ onSelect }>
    { spectrogramConfigurations?.map(spectrogram => (
      <option key={ spectrogram.id } value={ spectrogram.id }>
        nfft: { spectrogram.nfft } | winsize: { spectrogram.window_size } | overlap: { spectrogram.overlap } |
        scale: { getScaleName(spectrogram) }
      </option>
    ))
    }
  </select>
}