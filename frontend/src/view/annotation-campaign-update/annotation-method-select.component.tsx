import { FC } from "react";
import { AnnotationMethod } from "../../enum/annotation.enum.tsx";

export const AnnotationMethodSelectComponent: FC<{
  annotationMethod: AnnotationMethod,
  setAnnotationMethod: (annotationMethod: AnnotationMethod) => void
}> = ({annotationMethod, setAnnotationMethod}) => {

  return (
    <div className="form-group row">
      <label className="col-sm-7 col-form-label">Wanted distribution method for files amongst annotators:</label>
      <div className="col-sm-3">
        <select id="cac-annotation-method"
                value={ annotationMethod }
                className="form-control"
                onChange={ e => setAnnotationMethod(+e.currentTarget.value) }>
          <option value={ AnnotationMethod.notSelected } disabled>Select a method</option>
          <option value={ AnnotationMethod.random }>Random</option>
          <option value={ AnnotationMethod.sequential }>Sequential</option>
        </select>
      </div>
    </div>
  )
}