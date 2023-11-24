// @flow

import React, { Component } from 'react';

export type choices_type = {
  [?number]: {
    id: number,
    name: string
  }
};
  
type ListChooserProps = {
  choice_type: string,
  chosen_list: choices_type,
  choices_list: choices_type,
  onDelClick: (choice_id: number) => void,
  onSelectChange: (event: SyntheticEvent<HTMLInputElement>) => void
};

class ListChooser extends Component<ListChooserProps> {
  render() {
    let chosen_list = Array.from(this.props.chosen_list.values()).map(choice => {
      if (choice !== undefined) {
        return (
          <div className="col-sm-3 text-center border rounded" key={choice.id}>
            {choice.name} <button className="btn btn-danger" onClick={() => this.props.onDelClick(choice.id)}>x</button>
          </div>
        )
      } else {
        return null
      }
    });

    let select_choice;
    if (this.props.choices_list.size > 0) {
      let choices_list = Array.from(this.props.choices_list.values()).map(choice => {
        if (choice !== undefined) {
          return (
          <option key={choice.id} value={choice.id}>{choice.name}</option>
          );
        } else {
          return null
        }

      });
      select_choice = (
        <div className="col-sm-3">
          <select id={'cac-' + this.props.choice_type} value="placeholder" className="form-control" onChange={this.props.onSelectChange}>
            <option value="placeholder" disabled>Select a {this.props.choice_type}</option>
            {choices_list}
          </select>
        </div>
      )
    }

    return (
      <div className="form-group row">
        {chosen_list}
        {select_choice}
      </div>
    )
  }
}

export default ListChooser;
