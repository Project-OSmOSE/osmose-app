import React, { useMemo } from "react";
import { IonNote } from "@ionic/react";
import { focusResult } from "@/slices/annotator/annotations.ts";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { Annotation, AnnotationType, AnnotationMode } from "@/types/annotations.ts";
import { useAppSelector, useAppDispatch } from "@/slices/app";


export const AnnotationList: React.FC = () => {

  const {
    results,
    currentMode
  } = useAppSelector(state => state.annotator.annotations);

  const annotations: Array<Annotation> = useMemo(
    () => {
      // Need the spread to sort this readonly array
      return [...results].sort((a, b) => {
        if (currentMode === AnnotationMode.wholeFile) {
          if (a.annotation !== b.annotation) {
            return a.annotation.localeCompare(b.annotation);
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
          <th colSpan={ 5 }>Annotations</th>
        </tr>
        </thead>
        <tbody>
        { annotations.map((annotation: Annotation, idx: number) => (
          <AnnotationItem annotation={ annotation }
                          key={ idx }></AnnotationItem>
        )) }
        { annotations.length === 0 && <IonNote color="medium">No annotations</IonNote>}
        </tbody>
      </table>
    </div>
  )
}

interface ItemProps {
  annotation: Annotation
}

const AnnotationItem: React.FC<ItemProps> = ({ annotation }) => {

  const focusedResult = useAppSelector(state => state.annotator.annotations.focusedResult);
  const dispatch = useAppDispatch();

  switch (annotation.type) {
    case AnnotationType.box:
      return (
        <tr
          className={ annotation.id === focusedResult?.id && annotation.newId === focusedResult?.newId ? "isActive p-1" : "p-1" }
          onClick={ () => dispatch(focusResult(annotation)) }>
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
        </tr>
      );
    case AnnotationType.tag:
      return (
        <tr
          className={ annotation.id === focusedResult?.id && annotation.newId === focusedResult?.newId ? "isActive" : "" }
          onClick={ () => dispatch(focusResult(annotation)) }>
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
        </tr>
      );
  }
}
