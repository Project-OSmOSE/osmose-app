import { FormBloc, Input, Select } from "@/components/form";
import { useAppDispatch, useAppSelector } from "@/service/app";
import { selectDraftCampaign, updateDraftCampaign } from "@/service/campaign";
import { Dataset, DatasetAPI } from "@/service/dataset";
import { SpectrogramConfiguration } from "@/service/dataset/spectrogram-configuration";
import { Colormap, COLORMAP_GREYS, COLORMAPS } from "@/services/utils/color";
import React, { useMemo } from "react";

export const SpectrogramTuningBloc: React.FC = () => {
  // Services
  const dispatch = useAppDispatch();
  const { data: allDatasets } = DatasetAPI.useListQuery({})

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign);

  const isColormapEditable = useMemo(() => {
    const allSpectroConfigs: SpectrogramConfiguration[] = allDatasets
      ?.filter((dataset: Dataset) => draftCampaign.datasets
      ?.includes(dataset.name)).flatMap((dataset: Dataset) => dataset.spectros) ?? [];
    const selectedColormaps: string[] = allSpectroConfigs
      .filter((config) => draftCampaign.spectro_configs?.includes(config.id))
      .map((config) => config.colormap);
    return selectedColormaps.includes(COLORMAP_GREYS);
  }, [ draftCampaign ]);

  return <FormBloc label="Spectrogram Tuning">
    {/* Allow brightness / contrast tuning */}
    <Input
      type="checkbox"
      label="Allow brigthness / contrast modification"
      checked={ draftCampaign.allow_image_tuning ?? false }
      onChange={(evt) => dispatch(updateDraftCampaign({ allow_image_tuning: evt.target.checked }))}
    />

    {/* Allow colormap tuning */}
    <Input
      type="checkbox"
      label="Allow colormap modification"
      checked={ draftCampaign.allow_colormap_tuning ?? false }
      onChange={(evt) => dispatch(updateDraftCampaign({
        allow_colormap_tuning: evt.target.checked,
        colormap_default: evt.target.checked ? COLORMAP_GREYS : null,
        colormap_inverted_default: evt.target.checked ? false : null,
      }))}
      note={isColormapEditable ? undefined : "Available only when at least one spectrogram configuration was generated in grey scale"}
      disabled={!isColormapEditable}
    />

    {/* Default colormap */}
    { draftCampaign.allow_colormap_tuning && <Select
      required={ true }
      label="Default colormap"
      value={ draftCampaign.colormap_default ?? COLORMAP_GREYS }
      placeholder="Select a default colormap"
      optionsContainer="popover"
      options={ Object.keys(COLORMAPS).map((cmap) => ({
        value: cmap, label: cmap, img: `/app/images/colormaps/${cmap.toLowerCase()}.png`
      })) }
      onValueSelected={(value) => dispatch(updateDraftCampaign({ colormap_default: value as Colormap }))}
    /> }

    {/* Default colormap inverted? */}
    { draftCampaign.allow_colormap_tuning && <Input
      type="checkbox"
      label="Invert default colormap"
      checked={ draftCampaign.colormap_inverted_default ?? false }
      onChange={(evt) => dispatch(updateDraftCampaign({ colormap_inverted_default: evt.target.checked }))}
      note={isColormapEditable ? undefined : "Available only when at least one spectrogram configuration was generated in grey scale"}
      disabled={!isColormapEditable}
    /> }
  </FormBloc>;
}
