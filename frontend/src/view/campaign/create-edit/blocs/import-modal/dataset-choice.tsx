import React, { Fragment, ReactNode, useMemo, useState } from "react";
import { IonButton, IonCheckbox } from "@ionic/react";
import { WarningMessage } from "@/components/warning/warning-message.component";
import { DragNDropFileInput, DragNDropState, FormBloc } from "@/components/form";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { clearImport, setFilteredDatasets } from '@/service/campaign';


export const DatasetChoice: React.FC<{ cancelButton: ReactNode; }> = ({ cancelButton }) => {
  const [ datasetSelection, setDatasetSelection ] = useState<Map<string, boolean>>(new Map());
  const canValidateDatasets = useMemo(() => [ ...datasetSelection.values() ].includes(true), [ datasetSelection ]);

  // Form data
  const {
    resultImport,
    draftCampaign
  } = useAppSelector(state => state.campaign)
  const dispatch = useAppDispatch();

  const save = () => {
    const selection: string[] = [ ...datasetSelection.entries() ]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([ _, isSelected ]) => isSelected)
      .map(([ dataset ]) => dataset);
    dispatch(setFilteredDatasets(selection))
  }

  return (
    <Fragment>
      <div id="content">
        <DragNDropFileInput state={ DragNDropState.fileLoaded }
                            filename={ resultImport?.fileData?.filename ?? '' }
                            onReset={ () => dispatch(clearImport()) }/>
        <WarningMessage>
          <p>The selected file contains unrecognized dataset{ datasetSelection.size > 0 && 's' }</p>
        </WarningMessage>
        <FormBloc label="Dataset founds">
          { [ ...datasetSelection.entries() ].map(([ dataset, checked ]) => (
            <IonCheckbox labelPlacement="end" justify="start"
                         checked={ checked }
                         key={ dataset }
                         onIonChange={ event => {
                           const map = datasetSelection;
                           map.set(dataset, event.detail.checked)
                           setDatasetSelection(new Map(map));
                         } }>
              { dataset }
            </IonCheckbox>
          )) }
        </FormBloc>
      </div>

      <div id="buttons">
        { cancelButton }

        <IonButton disabled={ !canValidateDatasets }
                   aria-disabled={ !canValidateDatasets }
                   className="ion-text-wrap"
                   onClick={ save }>
          Use selected datasets as "{ draftCampaign.datasets![0] }"
        </IonButton>
      </div>
    </Fragment>
  )
}

