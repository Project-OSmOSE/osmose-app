import React, { Fragment, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { cloudUploadOutline, trashOutline } from "ionicons/icons";
import { ImportModal } from "@/view/campaign/create-edit/blocs/import-modal/import-modal.component.tsx";
import { ChipsInput } from "@/components/form";
import { clearImport, selectCurrentCampaign, selectDraftCampaign } from '@/service/campaign';

export const CheckAnnotationsInputs: React.FC<{
  onFileImported: (file: File) => void,
  onFileRemoved: () => void,
}> = ({ onFileImported, onFileRemoved }) => {

  // State
  const dispatch = useAppDispatch();
  const draftCampaign = useAppSelector(selectDraftCampaign);
  const createdCampaign = useAppSelector(selectCurrentCampaign)
  const {
    isSubmitted: areResultsSubmitted,
  } = useAppSelector(state => state.campaign.resultImport)
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);


  // Form data
  const [ detectorsSelection, setDetectorsSelection ] = useState<Map<string, boolean> | undefined>();

  // Memo
  const selectedDataset = useMemo(() => createdCampaign?.datasets.find(d => !!d) ?? draftCampaign.datasets?.find(d => !!d), [ createdCampaign?.datasets, draftCampaign.datasets ]);

  const onDetectorsChange = (array: Array<string | number>) => {
    setDetectorsSelection(previous => {
      if (!previous) return previous;
      const newMap = new Map<string, boolean>();
      for (const detector of previous.keys()) {
        newMap.set(detector, array.includes(detector));
      }
      return newMap
    })
  }

  const openImportModal = () => {
    setIsModalOpen(true)
  }

  const deleteDetectors = () => {
    dispatch(clearImport());
    onFileRemoved()
  }


  return (
    <Fragment>
      { !detectorsSelection?.size && <Fragment>
          <div id="import-button" className="d-flex justify-content-center">
              <IonButton color="dark" className="center"
                         onClick={ openImportModal }
                         disabled={ !selectedDataset || areResultsSubmitted }
                         aria-disabled={ !selectedDataset || areResultsSubmitted }>
                  Import annotations
                  <IonIcon icon={ cloudUploadOutline } slot="end"/>
              </IonButton>
              <input required={ true } className="hide-real-input"
                     value={ detectorsSelection?.size ? "ok" : undefined }
                     onChange={ () => {
                     } }/>
          </div>
        { !selectedDataset &&
            <IonNote color="danger" className="center">
                You must select a dataset to import annotations
            </IonNote> }
      </Fragment> }

      { !!selectedDataset && <ImportModal isOpen={ isModalOpen }
                                          setIsOpen={ setIsModalOpen }
                                          onFileImported={ onFileImported }/> }


      { !!detectorsSelection?.size && <div id="detector-import-results">
          <ChipsInput label="Detectors"
                      disabled={ areResultsSubmitted }
                      required={ true }
                      items={ [ ...detectorsSelection.keys() ].map(d => ({ value: d, label: d })) }
                      activeItemsValues={ [ ...detectorsSelection.entries() ]
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .filter(([ _, isSelected ]) => isSelected)
                        .map(([ d ]) => d) }
                      setActiveItemsValues={ onDetectorsChange }/>

          <IonButton color="danger"
                     disabled={ areResultsSubmitted }
                     onClick={ deleteDetectors }>
              <IonIcon icon={ trashOutline } slot="icon-only"/>
          </IonButton>
      </div> }

      {/*{ error && <IonNote color="danger">error</IonNote> }*/ }
    </Fragment>
  )
}
