import React, { Fragment } from "react";
import { Annotation } from "../../../../interface/annotation.interface.tsx";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";
import { formatTimestamp } from "../../../../services/annotator/format/format.util.tsx";
import { AnnotationType, AnnotationMode } from "../../../../enum/annotation.enum.tsx";


export const AnnotationList: React.FC = () => {
  const { context, annotations } = useAnnotatorService();
  if (!context.task) return <Fragment/>;
  const sortedAnnotations: Array<Annotation> = context.annotations.array.sort((a: Annotation, b: Annotation): number => {
    if (context.task?.annotationScope === AnnotationMode.wholeFile) {
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
                          onClick={ () => annotations.focus(annotation) }
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
  const {context: annotator} = useAnnotatorService();
  switch (annotation.type) {
    case AnnotationType.box:
      return (
        <tr key={ `listann-${ key }` }
            className={ annotation.id === annotator.annotations.focus?.id ? "isActive p-1" : "p-1" }
            onClick={ onClick }>
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
            { annotation.result_comments.length > 0 ? <i className="fas fa-comment mr-2"></i> :
              <i className="far fa-comment mr-2"></i> }
          </td>
        </tr>
      );
    case AnnotationType.tag:
      return (
        <tr key={ `listen-${ annotation.id }` }
            className={ annotation.id === annotator.annotations.focus?.id ? "isActive" : "" }
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