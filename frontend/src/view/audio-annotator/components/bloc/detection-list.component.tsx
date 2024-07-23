import React, { useMemo } from "react";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { focusResult, invalidateResult, validateResult } from "@/slices/annotator/annotations.ts";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { Annotation, AnnotationType, AnnotationMode } from "@/types/annotations.ts";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { RetrieveAnnotation } from "@/services/api/annotation-task-api.service.tsx";


export const DetectionList: React.FC = () => {

  const {
    results,
    currentMode
  } = useAppSelector(state => state.annotator.annotations);

  const annotations: Array<Annotation> = useMemo(
    () => {
      // Need the spread to sort this readonly array
      return [...results].sort((a, b) => {
        if (currentMode === AnnotationMode.wholeFile) {
          if (a.label !== b.label) {
            return a.label.localeCompare(b.label);
          }
        }
        return a.startTime - b.startTime;
      })
    },
    [results, currentMode])

  return (
    <div className='mt-2 table__rounded shadow-double border__black--125'>
      <table className="table table-hover rounded">
        <thead className="">
        <tr className="text-center bg__black--003">
          <th colSpan={ 8 }>Detections</th>
        </tr>
        </thead>
        <tbody>
        { annotations.map((annotation: Annotation, idx: number) => (
          <DetectionItem detection={ annotation }
                          key={ idx }></DetectionItem>
        )) }
        { annotations.length === 0 && <tr>
            <td colSpan={ 8 }>
                <IonNote color="medium">No detections</IonNote>
            </td>
        </tr> }
        </tbody>
      </table>
    </div>
  )
}

interface ItemProps {
  detection: Annotation
}

const DetectionItem: React.FC<ItemProps> = ({ detection }) => {

  const focusedResult = useAppSelector(state => state.annotator.annotations.focusedResult);
  const dispatch = useAppDispatch();

  switch (detection.type) {
    case AnnotationType.box:
      return (
        <tr
          className={ detection.id === focusedResult?.id && detection.newId === focusedResult?.newId ? "isActive p-1" : "p-1" }
          onClick={ () => dispatch(focusResult(detection)) }>
          <td className="p-1">
            <i className="fas fa-clock-o"></i>&nbsp;
            { formatTimestamp(detection.startTime) }&nbsp;&gt;&nbsp;
            { formatTimestamp(detection.endTime) }
          </td>
          <td className="p-1">
            <i className="fas fa-arrow-up"></i>&nbsp;
            { detection.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
            { detection.endFrequency.toFixed(2) } Hz
          </td>
          <td className="p-1">
            <i className="fas fa-tag"></i>&nbsp;
            { (detection.label !== '') ? detection.label : '-' }
          </td>
          <td className="p-1">
            <i className="fas fa-robot"></i>&nbsp;
            { (detection as RetrieveAnnotation).detector?.name }
          </td>
          <td className="p-1">
            <i className="fa fa-handshake"></i>&nbsp;
            { (detection.confidenceIndicator !== '') ? detection.confidenceIndicator : '-' }
          </td>
          <td className="p-1">
            { detection.result_comments.filter(c => c.comment).length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
          <td className="p-1 validation-buttons">
              <IonButton color={ detection.validation ? 'success' : 'medium' }
                         fill={ detection.validation ? 'solid' : 'outline' }
                         onClick={ () => dispatch(validateResult(detection)) }>
                  <IonIcon slot="icon-only" icon={ checkmarkOutline }/>
              </IonButton>
              <IonButton color={ detection.validation ? 'medium' : 'danger' }
                         fill={ detection.validation ? 'outline' : 'solid' }
                         onClick={ () => dispatch(invalidateResult(detection)) }>
                  <IonIcon slot="icon-only" icon={ closeOutline }/>
              </IonButton>
          </td>
        </tr>
      );
    case AnnotationType.tag:
      return (
        <tr
          className={ detection.id === focusedResult?.id && detection.newId === focusedResult?.newId ? "isActive" : "" }
          onClick={ () => dispatch(focusResult(detection)) }>
          <td colSpan={ 3 }>
            <strong>
              <i className="fas fa-tag"></i>&nbsp;
              { detection.label }
            </strong>
          </td>
          <td className="pl-1">
            <i className="fas fa-robot"></i>&nbsp;
            { (detection as RetrieveAnnotation).detector?.name }
          </td>
          <td className="pl-1">
            <i className="fa fa-handshake"></i>&nbsp;
            { (detection.confidenceIndicator !== '') ? detection.confidenceIndicator : '-' }
          </td>
          <td className="pl-1">
            { detection.result_comments.filter(c => c.comment).length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
          <td className="p-1 validation-buttons">
              <IonButton color={ detection.validation ? 'success' : 'medium' }
                         fill={ detection.validation ? 'solid' : 'outline' }
                         onClick={ () => dispatch(validateResult(detection)) }>
                  <IonIcon slot="icon-only" icon={ checkmarkOutline }/>
              </IonButton>
              <IonButton color={ detection.validation ? 'medium' : 'danger' }
                         fill={ detection.validation ? 'outline' : 'solid' }
                         onClick={ () => dispatch(invalidateResult(detection)) }>
                  <IonIcon slot="icon-only" icon={ closeOutline }/>
              </IonButton>
          </td>
        </tr>
      );
  }
}
