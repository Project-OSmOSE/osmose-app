import React from "react";
import { Annotation } from "../AudioAnnotator.tsx";
import { AnnotationMode } from "../../services/API/ApiService.data.tsx";
import * as utils from "../../utils.tsx";

interface Props {
  annotations: Array<Annotation>,
  annotationMode: AnnotationMode,
  onAnnotationClicked: (annotation: Annotation) => void
}

export const AnnotationList: React.FC<Props> = ({
                                                  annotations,
                                                  annotationMode,
                                                  onAnnotationClicked
                                                }) => {
  const sortedAnnotations: Array<Annotation> = annotations.sort((a: Annotation, b: Annotation): number => {
    if (annotationMode === AnnotationMode.wholeFile) {
      if (a.annotation !== b.annotation) {
        return a.annotation.localeCompare(b.annotation);
      }
    }
    return a.startTime - b.startTime;
  });

  return (
    <div className='mt-2 table__rounded shadow-double border__black--125'>
      <table className="table table-hover rounded">
        <thead className="">
        <tr className="text-center bg__black--003">
          <th colSpan={ 5 }>Annotations</th>
        </tr>
        </thead>
        <tbody>
        { sortedAnnotations.map((annotation: Annotation, idx: number) => (
          <AnnotationItem annotation={ annotation }
                          key={ idx }
                          onClick={ () => onAnnotationClicked(annotation) }
          ></AnnotationItem>
        )) }
        </tbody>
      </table>
    </div>
  )
}

interface ItemProps {
  annotation: Annotation,
  key: number,
  onClick: () => void
}

const AnnotationItem: React.FC<ItemProps> = ({ annotation, key, onClick }) => {
  switch (annotation.type) {
    case 'box':
      return (
        <tr key={ `listann-${ key }` }
            className={ annotation.active ? "isActive p-1" : "p-1" }
            onClick={ onClick }>
          <td className="p-1">
            <i className="fas fa-clock-o"></i>&nbsp;
            { utils.formatTimestamp(annotation.startTime) }&nbsp;&gt;&nbsp;
            { utils.formatTimestamp(annotation.endTime) }
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
            { annotation.result_comments.length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
        </tr>
      );
    case 'tag':
      return (
        <tr key={ `listen-${ annotation.id }` }
            className={ annotation.active ? "isActive" : "" }
            onClick={ onClick }>
          <td colSpan={ 3 }>
            <strong>
              <i className="fas fa-tag"></i>&nbsp;
              { annotation.annotation }
            </strong>
          </td>
          <td>
            <i className="fa fa-handshake"></i>&nbsp;
            { (annotation.confidenceIndicator !== '') ? annotation.confidenceIndicator : '-' }
          </td>
          <td className="pl-1">
            { annotation.result_comments.length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
        </tr>
      );
  }
}