import React, { Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { cloudUploadOutline, trashOutline } from "ionicons/icons";
import { ImportModal } from "@/view/campaign/create-edit/blocs/import-modal/import-modal.component.tsx";
import { ChipsInput } from "@/components/form";
import { useToast } from "@/services/utils/toast.ts";
import { selectDraftCampaign } from '@/service/campaign';
import { useListDetectorQuery } from '@/service/campaign/detector/api.ts';
import { getErrorMessage } from '@/service/function.ts';

export const CheckAnnotationsInputs: React.FC<{ areResultsSubmitted: boolean }> = ({ areResultsSubmitted }) => {

  // State
  const dispatch = useAppDispatch();
  const draftCampaign = useAppSelector(selectDraftCampaign);
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const _file = useRef<File | undefined>();

  // Service
  const toast = useToast();
  const { data: allDetectors, error: detectorListError } = useListDetectorQuery();

  // Form data
  const {
    selectedDetectors
  } = useAppSelector(state => state.createCampaignForm.importAnnotations)
  const _selectedDetectors = useRef(selectedDetectors)
  useEffect(() => {
    _selectedDetectors.current = selectedDetectors
    if (!selectedDetectors) setDetectorsSelection(new Map());
    else setDetectorsSelection(new Map(selectedDetectors.map(d => [ d.knownDetector?.name ?? d.initialName, true ])))
  }, [ selectedDetectors ]);

  const [ detectorsSelection, setDetectorsSelection ] = useState<Map<string, boolean> | undefined>();
  const _detectorsSelection = useRef<Map<string, boolean> | undefined>();
  useEffect(() => {
    _detectorsSelection.current = detectorsSelection;
  }, [ detectorsSelection ]);
  const _campaignID = useRef<number | undefined>();


  useEffect(() => {
    return () => {
      toast.dismiss();
    }
  }, [])

  useEffect(() => {
    if (detectorListError) toast.presentError(getErrorMessage(detectorListError));
  }, [ detectorListError ])


  useEffect(() => {
    if (detectorListError) toast.presentError(getErrorMessage(detectorListError));
  }, [ detectorListError ])

  const submit = async (force: boolean = false) => {
    if (!_detectorsSelection.current) throw new Error("Error while recovering detectors selection");
    const detectorsToImport = [ ..._detectorsSelection.current.entries() ]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([ _, isSelected ]) => isSelected);
    if (!detectorsToImport.length) {
      setError("You must import annotations")
      throw new Error("You must import annotations");
    }
    if (areResultsSubmitted) throw 'Already submitted';
    if (!_campaignID.current) throw 'Missing campaignID';
    if (!_file.current) throw 'Missing file';
    if (!dataset) throw 'Missing dataset';
    if (!_selectedDetectors.current) throw 'Missing selectedDetectors';
    let retry = false;
    try {
      const results = await resultAPI.importAnnotations(
        _campaignID.current,
        _file.current,
        dataset,
        _selectedDetectors.current.filter(d => _detectorsSelection.current?.get(d.initialName)),
        force);
      setSubmittedResults(results);
    } catch (e) {
      if ((e as any).status === 400) {
        const response = (e as any).response.text;
        try {
          const response_errors: string[] = JSON.parse(response).flatMap((result_error: any) => Object.values(result_error)).flat()
          const distinct_errors = [ ...new Set(response_errors) ];
          const outOfFilesError = "This start and end datetime does not belong to any file of the dataset";
          if (response_errors.includes(outOfFilesError)) {
            retry = await toast.presentError(distinct_errors.map((error: string) => {
              const count = response_errors.filter((err: string) => err.includes(error)).length;
              return `[${ count } results]: ${ error }`
            }).join('\n'), true);
          }
        } catch (e) {
          console.warn(e)
        }
      }
      if (!retry) throw e
    }
    if (retry) await submit(true)
  }

  useImperativeHandle(ref, () => ({
    get isValid() {
      if (!_detectorsSelection.current) return false;
      return [ ..._detectorsSelection.current.values() ].some(isSelected => isSelected);
    },
    submit,
    setCampaignID: (id: number) => _campaignID.current = id
  }), [])

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
    dispatch(importAnnotationsActions.clear());
  }


  return (
    <Fragment>
      { !detectorsSelection?.size && <Fragment>
          <div id="import-button" className="d-flex justify-content-center">
              <IonButton color="dark" className="center"
                         onClick={ openImportModal }
                         disabled={ !dataset || areResultsSubmitted }
                         aria-disabled={ !dataset || areResultsSubmitted }>
                  Import annotations
                  <IonIcon icon={ cloudUploadOutline } slot="end"/>
              </IonButton>
              <input required={ true } className="hide-real-input"
                     value={ detectorsSelection?.size ? "ok" : undefined }
                     onChange={ () => {
                     } }/>
          </div>
        { !dataset &&
            <IonNote color="danger" className="center">
                You must select a dataset to import annotations
            </IonNote> }
      </Fragment> }

      { !!dataset && <ImportModal isOpen={ isModalOpen }
                                  setIsOpen={ setIsModalOpen }
                                  allDetectors={ allDetectors }
                                  onFileImported={ file => _file.current = file }/> }


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

      { error && <IonNote color="danger">error</IonNote> }
    </Fragment>
  )
}
