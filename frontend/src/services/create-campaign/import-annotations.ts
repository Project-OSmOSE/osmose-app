import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { importAnnotationsActions, ImportAnnotationsError } from "@/slices/create-campaign/import-annotations.ts";
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { formatCSV } from "@/services/utils/format.tsx";
import { useEffect } from "react";

export const useImportAnnotations = () => {
  const {
    initialRows,
    status,
    datasetName,
    areDetectorsChosen,
    selectedDatasets
  } = useAppSelector(state => state.createCampaignForm.importAnnotations)
  const dispatch = useAppDispatch()

  useEffect(() => {
    checkErrors();
  }, [ initialRows ])

  function checkErrors() {
    if (status === 'empty') return;

    if (initialRows.length < 1) {
      dispatch(importAnnotationsActions.setErrors([ {
        type: 'unrecognised file',
        error: 'Not enough rows'
      } ]));
      dispatch(importAnnotationsActions.setStatus('errors'));
      return;
    }

    const errors: Array<ImportAnnotationsError> = [];
    if (!selectedDatasets?.length) {
      const otherDatasets = initialRows.map(r => r.dataset).filter(d => d !== datasetName)
      if (otherDatasets.length > 0)
        errors.push({
          type: 'contains unrecognized dataset',
          error: `Found different datasets than requested: ${ otherDatasets.join(', ') }`
        });
    }

    dispatch(importAnnotationsActions.setErrors(errors));
    if (errors.length < 1)
      if (areDetectorsChosen)
        dispatch(importAnnotationsActions.setStatus('edit-detectors-config'))
      else
        dispatch(importAnnotationsActions.setStatus('edit-detectors'))
    else
      dispatch(importAnnotationsActions.setStatus('errors'));
  }

  return {
    loadFile: async (file: File) => {
      dispatch(importAnnotationsActions.setStatus('loading'));
      dispatch(importAnnotationsActions.setFilename(file.name));

      if (!ACCEPT_CSV_MIME_TYPE.includes(file.type)) {
        console.warn('Load CSV', 'Unsupported MIME type:', file.type);
        dispatch(importAnnotationsActions.setErrors([ {
          type: 'unrecognised file',
          error: `Wrong MIME Type, found : ${ file.type } ; but accepted types are: ${ ACCEPT_CSV_MIME_TYPE }`
        } ]))
        dispatch(importAnnotationsActions.setStatus('errors'));
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onerror = () => {
        console.warn('Load CSV', 'Reading error');
        dispatch(importAnnotationsActions.setErrors([ {
          type: 'unrecognised file',
          error: 'Error reading file, check the file isn\'t corrupted'
        } ]))
        dispatch(importAnnotationsActions.setStatus('errors'));
      }

      reader.onload = (event) => {
        const result = event.target?.result;
        if (!result || typeof result !== 'string') {
          console.warn('Load CSV', 'Unsupported read data', result);
          dispatch(importAnnotationsActions.setErrors([ {
            type: 'unrecognised file',
            error: `The file is empty or it does not contain a string content.`
          } ]))
          dispatch(importAnnotationsActions.setStatus('errors'));
          return;
        }

        try {
          const data = formatCSV(
            result,
            ACCEPT_CSV_SEPARATOR,
            IMPORT_ANNOTATIONS_COLUMNS
          );
          if (!data) {
            console.warn('Load CSV', 'Empty formatted data');
            dispatch(importAnnotationsActions.setErrors([ {
              type: 'unrecognised file',
              error: 'Cannot format the file data'
            } ]))
            dispatch(importAnnotationsActions.setStatus('errors'));
            return;
          }

          dispatch(importAnnotationsActions.setInitialRows(
            data.map(d => {
              const confidenceLevel = d.confidence_indicator_level ? d.confidence_indicator_level.split('/') : d.confidence_indicator_level;
              return {
                ...d,
                start_time: +d.start_time,
                end_time: +d.end_time,
                start_frequency: +d.start_frequency,
                end_frequency: +d.end_frequency,
                detector: d.annotator,
                is_box: !!+d.is_box,
                confidence_indicator_level: confidenceLevel?.length > 0 ? +confidenceLevel[0] : undefined,
                confidence_indicator_max_level: confidenceLevel?.length > 1 ? +confidenceLevel[1] : undefined,
              }
            })
          ));
        } catch (e) {
          dispatch(importAnnotationsActions.setErrors([ {
            type: 'unrecognised file',
            error: e as Error
          } ]))
          dispatch(importAnnotationsActions.setStatus('errors'));
        }
      }
    },
  }
}
