import { FC } from "react";
import { AnnotationMode } from "../../enum/annotation.enum.tsx";

export const AnnotationModeSelectComponent: FC<{
  annotationMode: AnnotationMode,
  setAnnotationMode: (annotationMode: AnnotationMode) => void,
}> = ({ annotationMode, setAnnotationMode }) => {

  return (
    <div className="form-group">
      <label className="col-sm-7 col-form-label">Annotation mode</label>
      <select id="cac-annotation-mode"
              value={ annotationMode }
              className="form-control"
              onChange={ (e) => setAnnotationMode(+e.currentTarget.value) }>
        <option value={ AnnotationMode.boxes }>Boxes</option>
        <option value={ AnnotationMode.wholeFile }>Whole file</option>
      </select>
    </div>
  )
}
