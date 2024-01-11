import { ChangeEvent, FC, useState } from "react";
import { AnnotationSetList, AnnotationSetListItem } from '../../services/api';

export const AnnotationSetSelectComponent: FC<{
  annotationSets: AnnotationSetList,
  selectAnnotationSet: (annotationSet: AnnotationSetListItem | undefined) => void,
}> = ({ annotationSets, selectAnnotationSet }) => {
  const [selected, setSelected] = useState<AnnotationSetListItem | undefined>(undefined);

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const set = annotationSets.find(s => s.id === +event.currentTarget.value);
    setSelected(set);
    selectAnnotationSet(set);
  }

  return (
    <div className="form-group">
      <div className="col-sm-4 offset-sm-4">
        <select id="cac-annotation-set"
                value={ selected?.id ?? 0 }
                className="form-control"
                onChange={ handleOnChange }>
          <option value={ 0 } disabled>Select an annotation set</option>
          { annotationSets.map(set => (
            <option key={ set.id } value={ set.id }>{ set.name }</option>
          )) }
        </select>
      </div>

      { selected &&
          <div className="col-sm-12 border rounded">
              <p>{ selected.desc }</p>
              <p><b>Tags: </b>{ selected.tags.join(', ') }</p>
          </div>
      }
    </div>
  )
}