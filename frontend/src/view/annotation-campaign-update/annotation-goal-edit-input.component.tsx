import { FC } from "react";

export const AnnotationGoalEditInputComponent: FC<{
  annotationGoal: number,
  setAnnotationGoal: (annotationGoal: number) => void,
}> = ({startDate, setAnnotationGoal}) => {

  return (
    <div className="form-group row">
      <label className="col-sm-5 col-form-label">Wanted number of files to annotate<br/>(0 for all files):</label>
      <div className="col-sm-2">
        <input id="cac-annotation-goal"
               className="form-control"
               type="number"
               min={ 0 }
               value={ startDate }
               onChange={ e => setAnnotationGoal(+e.currentTarget.value) }/>
      </div>
    </div>
  )
}