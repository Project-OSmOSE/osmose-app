import { FC } from 'react';

interface Item {
  id: number,
  name: string
}

type ListChooserProps = {
  choice_type: string,
  chosen_list: Array<Item>,
  choices_list: Array<Item>,
  onDelClick: (choice_id: number) => void,
  onSelectChange: (choice_id: number) => void
};

export const ListChooser: FC<ListChooserProps> = ({ choice_type, chosen_list, choices_list, onDelClick, onSelectChange }) => {
  return (
    <div className="form-group row">
      { chosen_list.map(choice => (
          <div className="col-sm-3 text-center border rounded" key={ choice.id }>
            { choice.name }
            <button className="btn btn-danger" onClick={ e => {
              e.preventDefault();
              onDelClick(choice.id)
            } }>x</button>
          </div>
        )) }

      { choices_list.length > 0 && (
        <div className="col-sm-3">
          <select id={ `cac-${choice_type}` } value="placeholder" className="form-control"
                  onChange={ (e) => onSelectChange(+e.currentTarget.value) }>
            <option value="placeholder" disabled>Select a { choice_type }</option>
            { choices_list.map(choice => (
              <option key={ choice.id } value={ choice.id }>{ choice.name }</option>
            ))}
          </select>
        </div>
        ) }
    </div>
  )
}
