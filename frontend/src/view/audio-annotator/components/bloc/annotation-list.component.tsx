import React, { useContext, useMemo } from "react";
import { Annotation } from "../../../../interface/annotation.interface.tsx";
import { formatTimestamp } from "../../../../services/format/format.util.tsx";
import { AnnotationType, AnnotationMode } from "../../../../enum/annotation.enum.tsx";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";
import { AnnotatorContext } from "../../../../services/annotator/annotator.context.tsx";
import { IonButton, IonIcon } from "@ionic/react";
import { checkmarkOutline, closeOutline } from "ionicons/icons";


export const AnnotationList: React.FC = () => {

  const context = useContext(AnnotationsContext);
  const annotatorContext = useContext(AnnotatorContext);

  const annotations: Array<Annotation> = useMemo(
    () => context.results.sort((a, b) => {
      if (context.currentMode === AnnotationMode.wholeFile) {
        if (a.annotation !== b.annotation) {
          return a.annotation.localeCompare(b.annotation);
        }
      }
      return a.startTime - b.startTime;
    }),
    [context.results, context.currentMode])

  return (
    <div className='mt-2 table__rounded shadow-double border__black--125'>
      <table className="table table-hover rounded">
        <thead className="">
        <tr className="text-center bg__black--003">
          <th colSpan={ annotatorContext.mode === 'Create' ? 5 : 7 }>Annotations</th>
        </tr>
        </thead>
        <tbody>
        { annotations.map((annotation: Annotation, idx: number) => (
          <AnnotationItem annotation={ annotation }
                          key={ idx }></AnnotationItem>
        )) }
        </tbody>
      </table>
    </div>
  )
}

interface ItemProps {
  annotation: Annotation
}

const AnnotationItem: React.FC<ItemProps> = ({ annotation }) => {

  const context = useContext(AnnotationsContext);
  const annotatorContext = useContext(AnnotatorContext);
  const dispatch = useContext(AnnotationsContextDispatch);

  switch (annotation.type) {
    case AnnotationType.box:
      return (
        <tr
          className={ annotation.id === context.focusedResult?.id && annotation.newId === context.focusedResult?.newId ? "isActive p-1" : "p-1" }
          onClick={ () => dispatch!({ type: 'focusResult', result: annotation }) }>
          <td className="p-1">
            <i className="fas fa-clock-o"></i>&nbsp;
            { formatTimestamp(annotation.startTime) }&nbsp;&gt;&nbsp;
            { formatTimestamp(annotation.endTime) }
          </td>
          <td className="p-1">
            <i className="fas fa-arrow-up"></i>&nbsp;
            { annotation.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
            { annotation.endFrequency.toFixed(2) } Hz
          </td>
          <td className="p-1">
            <i className="fas fa-tag"></i>&nbsp;
            { (annotation.annotation !== '') ? annotation.annotation : '-' }
          </td>
          <td className="p-1">
            <i className="fa fa-handshake"></i>&nbsp;
            { (annotation.confidenceIndicator !== '') ? annotation.confidenceIndicator : '-' }
          </td>
          <td className="p-1">
            { annotation.result_comments.filter(c => c.comment).length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
          { annotatorContext.mode === 'Check' && <td className="p-1 validation-buttons">
              <IonButton color={ annotation.validation ? 'success' : 'medium' }
                         fill={ annotation.validation ? 'solid' : 'outline' }
                         onClick={ () => dispatch!({ type: 'validateResult', result: annotation }) }>
                  <IonIcon slot="icon-only" icon={ checkmarkOutline }/>
              </IonButton>
              <IonButton color={ annotation.validation ? 'medium' : 'danger' }
                         fill={ annotation.validation ? 'outline' : 'solid' }
                         onClick={ () => dispatch!({ type: 'invalidateResult', result: annotation }) }>
                  <IonIcon slot="icon-only" icon={ closeOutline }/>
              </IonButton>
          </td> }
        </tr>
      );
    case AnnotationType.tag:
      return (
        <tr
          className={ annotation.id === context.focusedResult?.id && annotation.newId === context.focusedResult?.newId ? "isActive" : "" }
          onClick={ () => dispatch!({ type: 'focusResult', result: annotation }) }>
          <td colSpan={ 3 }>
            <strong>
              <i className="fas fa-tag"></i>&nbsp;
              { annotation.annotation }
            </strong>
          </td>
          <td className="pl-1">
            <i className="fa fa-handshake"></i>&nbsp;
            { (annotation.confidenceIndicator !== '') ? annotation.confidenceIndicator : '-' }
          </td>
          <td className="pl-1">
            { annotation.result_comments.filter(c => c.comment).length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
          { annotatorContext.mode === 'Check' && <td className="p-1 validation-buttons">
              <IonButton color={ annotation.validation ? 'success' : 'medium' }
                         fill={ annotation.validation ? 'solid' : 'outline' }
                         onClick={ () => dispatch!({ type: 'validateResult', result: annotation }) }>
                  <IonIcon slot="icon-only" icon={ checkmarkOutline }/>
              </IonButton>
              <IonButton color={ annotation.validation ? 'medium' : 'danger' }
                         fill={ annotation.validation ? 'outline' : 'solid' }
                         onClick={ () => dispatch!({ type: 'invalidateResult', result: annotation }) }>
                  <IonIcon slot="icon-only" icon={ closeOutline }/>
              </IonButton>
          </td> }
        </tr>
      );
  }
}
