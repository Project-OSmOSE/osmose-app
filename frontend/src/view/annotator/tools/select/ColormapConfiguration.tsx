import { Select } from "@/components/form";
import { setColormapInverted, setColormap } from "@/service/annotator/slice";
import { useCurrentConfiguration } from "@/service/annotator/spectrogram";
import { useAppDispatch, useAppSelector } from "@/service/app";
import { Colormap, COLORMAP_GREYS, COLORMAPS } from "@/services/utils/color";
import { IonButton, IonIcon } from "@ionic/react";
import { invertModeSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";

export const ColormapConfiguration: React.FC = () => {
  const dispatch = useAppDispatch();

  const [changeAllowed, setChangeAllowed] = useState<boolean>(false);

  const campaign = useAppSelector(state => state.campaign.currentCampaign);
  const currentConfiguration = useCurrentConfiguration();
  const colormap = useAppSelector(state => state.annotator.userPreferences.colormap);
  const colormapInverted = useAppSelector(state => state.annotator.userPreferences.colormapInverted);

  useEffect(() => {
    const computedAllowed: boolean = !!campaign?.allow_colormap_tuning && !!currentConfiguration && currentConfiguration.colormap === COLORMAP_GREYS
    setChangeAllowed(computedAllowed)
    if (computedAllowed) {
      dispatch(setColormap(colormap ?? campaign?.colormap_default ?? COLORMAP_GREYS))
      dispatch(setColormapInverted(colormapInverted ?? campaign?.colormap_inverted_default ?? false))
    }
  }, [campaign, currentConfiguration])

  if (!changeAllowed) return;

  const onSelect = (value: number | string | undefined) => {
    dispatch(setColormap(value as Colormap))
    dispatch(setColormapInverted(false))
  }

  return <div>
    {/* Colormap selection */}
    <Select
      required={ true }
      value={ colormap }
      placeholder="Select a colormap"
      onValueSelected={ onSelect }
      optionsContainer="popover"
      options={ Object.keys(COLORMAPS).map((cmap) => ({
        value: cmap, label: cmap, img: `/app/images/colormaps/${cmap.toLowerCase()}.png`
      })) }
    />

    {/* Colormap inversion */}
    <IonButton
      color="primary"
      className={ colormapInverted ? "inverted" : "" }
      fill={ colormapInverted ? "outline" : "default" }
      onClick={ () => dispatch(setColormapInverted(!colormapInverted)) }>
      <IonIcon icon={ invertModeSharp } slot={ "icon-only" } />
    </IonButton>
  </div>;
}
