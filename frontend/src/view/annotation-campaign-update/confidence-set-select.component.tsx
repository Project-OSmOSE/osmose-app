import { ChangeEvent, FC, useState } from "react";
import { ConfidenceSetList, ConfidenceSetListItem } from '../../services/api';

export const ConfidenceSetSelectComponent: FC<{
  confidenceSets: ConfidenceSetList,
  selectConfidence: (confidence: ConfidenceSetListItem | undefined) => void,
}> = ({ confidenceSets, selectConfidence }) => {
  const [selected, setSelected] = useState<ConfidenceSetListItem | null | undefined>(undefined);
  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.currentTarget.value === "no-confidence-indicator-set") {
      setSelected(null)
      selectConfidence(undefined);
      return;
    }
    const set = confidenceSets.find(s => s.id === +event.currentTarget.value);
    setSelected(set);
    selectConfidence(set);
  }

  return (
    <div className="form-group">
      <div className="col-sm-4 offset-sm-4">
        <select id="cac-confidence-indicator-set"
                value={ selected === null ? 'null-confidence-indicators' : selected?.id ?? 0 } className="form-control"
                onChange={ handleOnChange }>
          <option value={ 0 } disabled>Select a confidence indicator set</option>
          <option key="null-confidence-indicators" value="no-confidence-indicator-set">No Confidence Indicator Set
          </option>
          { confidenceSets.map(set => (
            <option key={ set.id } value={ set.id }>{ set.name }</option>
          )) }
        </select>
      </div>
      { selected &&
          <div className="col-sm-12 border rounded">
              <p>{ selected.desc }</p>
            { selected.confidenceIndicators.map((confidence_indicator: any) => {
              return (
                <p key={ "confidence" + confidence_indicator.level + "_" + confidence_indicator.label }>
                  <b>{ confidence_indicator.level }: </b> { confidence_indicator.label }</p>
              )
            }) }
          </div>
      }
    </div>
  )
}
