import React, { Fragment, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { SpectrogramConfiguration } from "@/service/types";
import { Select } from "@/components/form";
import { useListSpectrogramForCurrentCampaign } from "@/service/api/spectrogram-configuration.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";

export const NFFTSelect: React.FC = () => {
  const { data } = useRetrieveAnnotator();
  const selectedID = useAppSelector(state => state.annotator.userPreferences.spectrogramConfigurationID);
  const { configurations } = useListSpectrogramForCurrentCampaign();

  const dispatch = useAppDispatch()

  useEffect(() => {
    console.debug('[Update spectro] 1', selectedID)
    if (!selectedID) return;
    const configs: SpectrogramConfiguration[] = configurations ?? [];
    console.debug('[Update spectro] 2', configs)
    if (configs.find(c => c.id === selectedID)) return;
    const simpleSpectrogramID = configs?.find(s => !s.multi_linear_frequency_scale && !s.linear_frequency_scale)?.id;
    const newID = simpleSpectrogramID ?? Math.min(...configs.map(s => s.id));
    console.debug('[Update spectro] 3', simpleSpectrogramID, newID)
    dispatch(AnnotatorSlice.actions.selectSpectrogramConfiguration(newID))
  }, [selectedID]);

  const options = useMemo(() => {
    if (!configurations) return []
    return configurations.map(c => {
      let label = `nfft: ${ c.nfft }`;
      label += ` | winsize: ${ c.window_size }`
      label += ` | overlap: ${ c.overlap }`
      label += ` | scale: ${ c.scale_name }`
      return { value: c.id, label }
    })
  }, [ configurations ]);

  function select(value: string | number | undefined) {
    if (value === undefined) return;
    dispatch(AnnotatorSlice.actions.selectSpectrogramConfiguration(+value))
  }

  if (!data) return <Fragment/>
  return <Select placeholder='Select a configuration'
                 options={ options }
                 optionsContainer='popover'
                 value={ selectedID }
                 required={ true }
                 onValueSelected={ select }/>
}