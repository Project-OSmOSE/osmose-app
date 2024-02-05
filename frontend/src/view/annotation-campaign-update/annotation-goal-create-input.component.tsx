import { FC } from "react";
import { UserList } from "../../services/api";

export const AnnotationGoalCreateInputComponent: FC<{
  filesCounts?: number,
  annotators: UserList,
  annotationGoal: number,
  setAnnotationGoal: (annotationGoal: number) => void,
}> = ({annotationGoal, setAnnotationGoal, filesCounts, annotators}) => {

  let filesPerPerson;
  if (filesCounts) filesPerPerson = Math.floor(filesCounts * annotationGoal / annotators.length);

  return (
    <div className="form-group row">
      <label className="col-sm-5 col-form-label">Wanted number of annotators per file:</label>
      <div className="col-sm-2">
        <input id="cac-annotation-goal" className="form-control" type="number" min={ 0 }
               value={ annotationGoal }
               onChange={ e => {
                 setAnnotationGoal(Math.min(annotators.length, Math.max(+e.currentTarget.value, 1)));
               } }/>
      </div>
      { filesCounts && filesPerPerson &&
          <p className="col-sm-5">
              Each annotator will annotate at least { filesPerPerson } files in the campaign
              ({ Math.round(filesPerPerson / filesCounts * 100) }%), which contains
            { filesCounts } files in total
          </p> }
    </div>
  )
}
