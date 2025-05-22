import { Input } from "@/components/form";
import { useAppDispatch, useAppSelector } from "@/service/app";
import { IonButton, IonIcon } from "@ionic/react";
import { contrastOutline, sunnyOutline } from "ionicons/icons";
import React, { Fragment, useMemo } from "react";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";

export const SpectrogramImage: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const dispatch = useAppDispatch();

  const changeAllowed = useMemo(() => campaign?.allow_image_tuning, [ campaign ]);
  const brightness = useAppSelector(state => state.annotator.userPreferences.brightness);
  const contrast = useAppSelector(state => state.annotator.userPreferences.contrast);

  if (!changeAllowed) return;

  return <Fragment>
    <div>
      <IonButton color="primary" fill="default" onClick={ () => dispatch(AnnotatorSlice.actions.setBrightness(50)) }>
        <IonIcon icon={ sunnyOutline } slot="icon-only"/>
      </IonButton>
      <Input type="range" name="brightness-range" min="0" max="100" value={ brightness }
             onChange={ (evt) => dispatch(AnnotatorSlice.actions.setBrightness(evt.target.valueAsNumber)) }
             onDoubleClick={ () => dispatch(AnnotatorSlice.actions.setBrightness(50)) }/>
      <Input type="number" name="brightness" min="0" max="100" value={ brightness }
             onChange={ (evt) => dispatch(AnnotatorSlice.actions.setBrightness(evt.target.valueAsNumber)) }/>
    </div>

    <div>
      <IonButton color="primary" fill="default" onClick={ () => dispatch(AnnotatorSlice.actions.setContrast(50)) }>
        <IonIcon icon={ contrastOutline } slot="icon-only"/>
      </IonButton>
      <Input type="range" name="contrast-range" min="0" max="100" value={ contrast }
             onChange={ (evt) => dispatch(AnnotatorSlice.actions.setContrast(evt.target.valueAsNumber)) }
             onDoubleClick={ () => dispatch(AnnotatorSlice.actions.setContrast(50)) }/>
      <Input type="number" name="contrast" min="0" max="100" value={ contrast }
             onChange={ (evt) => dispatch(AnnotatorSlice.actions.setContrast(evt.target.valueAsNumber)) }/>
    </div>
  </Fragment>;
}
