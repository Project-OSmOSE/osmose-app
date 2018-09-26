// @flow

import React, { Component } from 'react';
import request from 'superagent';
import * as utils from './utils';

if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const GET_DATASETS_API_URL = process.env.REACT_APP_API_URL + '/dataset/list';
const GET_ANNOTATION_SETS_API_URL = process.env.REACT_APP_API_URL + '/annotation-set/list';
const GET_USERS_API_URL = process.env.REACT_APP_API_URL + '/user/list';
const POST_ANNOTATION_CAMPAIGN_API_URL = process.env.REACT_APP_API_URL + '/annotation-campaign/new';

type choices_type = {
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
    let chosen_list = utils.objectValues(this.props.chosen_list).map(choice => {
      return(
        <div className="col-sm-3 text-center border rounded" key={choice.id}>
          {choice.name} <button className="btn btn-danger" onClick={() => this.props.onDelClick(choice.id)}>x</button>
        </div>
      )
    });

    let select_choice;
    if (Object.keys(this.props.choices_list).length > 0) {
      let choices_list = utils.objectValues(this.props.choices_list).map(choice => {
        return (
          <option key={choice.id} value={choice.id}>{choice.name}</option>
        );
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

type annotation_set_type = {
  id: number,
  name: string,
  desc: string,
  tags: Array<string>
};

type ShowAnnotationSetProps = {
  annotation_sets: {
    [?number]: annotation_set_type
  },
  onChange: (event: SyntheticEvent<HTMLInputElement>) => void
};

type ShowAnnotationSetState = {
  selected_id: number,
  selected: ?annotation_set_type
};

class ShowAnnotationSet extends Component<ShowAnnotationSetProps, ShowAnnotationSetState> {
  state = {
    selected_id: 0,
    selected: null
  }

  handleOnChange = (event: SyntheticEvent<HTMLInputElement>) => {
    let id = parseInt(event.currentTarget.value, 10);
    this.setState({
      selected_id: id,
      selected: this.props.annotation_sets[id]
    });
    this.props.onChange(event);
  }

  render() {
    let options = utils.objectValues(this.props.annotation_sets).map(annotation_set => {
      let id = annotation_set.id;
      return (
        <option key={id} value={id}>{annotation_set.name}</option>
      );
    });

    return (
      <div className="form-group">
        <div className="col-sm-4 offset-sm-4">
          <select id="cac-annotation-set" value={this.state.selected_id} className="form-control" onChange={this.handleOnChange}>
            <option value={0} disabled>Select an annotation set</option>
            {options}
          </select>
        </div>
        {this.state.selected &&
          <div className="col-sm-12 border rounded">
            <p>{this.state.selected.desc}</p>
            <p><b>Tags: </b>{this.state.selected.tags.join(', ')}</p>
          </div>
        }
      </div>
    )
  }
}

type CACProps = {
  app_token: string,
  history: {
    push: (url: string) => void
  }
};

type CACState = {
  new_ac_name: string,
  new_ac_desc: string,
  new_ac_datasets: choices_type,
  new_ac_start: string,
  new_ac_end: string,
  new_ac_annotation_set: number,
  new_ac_annotators: choices_type,
  new_ac_annotation_goal: number,
  new_ac_annotation_method: number,
  dataset_choices: choices_type,
  annotation_set_choices: {
    [?number]: annotation_set_type
  },
  annotator_choices: choices_type,
  error: ?{
    status: number,
    message: string
  }
};

class CreateAnnotationCampaign extends Component<CACProps, CACState> {
  state = {
    new_ac_name: '',
    new_ac_desc: '',
    new_ac_datasets: {},
    new_ac_start: '',
    new_ac_end: '',
    new_ac_annotation_set: 0,
    new_ac_annotators: {},
    new_ac_annotation_goal: 0,
    new_ac_annotation_method: -1,
    dataset_choices: {},
    annotation_set_choices: {},
    annotator_choices: {},
    error: null
  }
  getDatasets = request.get(GET_DATASETS_API_URL)
  getAnnotationSets = request.get(GET_ANNOTATION_SETS_API_URL)
  getUsers = request.get(GET_USERS_API_URL)
  postAnnotationCampaign = { abort: () => null }

  componentDidMount() {
    // TODO the following error handling is very messy
    // This should be fixed in a future rework of API calls
    return Promise.all([
      this.getDatasets.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
        this.setState({
          dataset_choices: utils.arrayToObject(req.body, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0';
          window.location.reload();
        }
        this.setState({
          error: err
        });
      }),
      this.getAnnotationSets.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
        this.setState({
          annotation_set_choices: utils.arrayToObject(req.body, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0';
          window.location.reload();
        }
        this.setState({
          error: err
        });
      }),
      this.getUsers.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
        let users = req.body.map(user => { return { id: user.id, name: user.email }; });
        this.setState({
          annotator_choices: utils.arrayToObject(users, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0';
          window.location.reload();
        }
        this.setState({
          error: err
        });
      })
    ]);

  }

  componentWillUnmount() {
    this.getDatasets.abort();
    this.getAnnotationSets.abort();
    this.getUsers.abort();
    this.postAnnotationCampaign.abort();
  }

  handleNameChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_name: event.currentTarget.value});
  }

  handleDescChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_desc: event.currentTarget.value});
  }

  handleAddDataset = (event: SyntheticEvent<HTMLInputElement>) => {
    let dataset_id = parseInt(event.currentTarget.value, 10);
    let dataset_choices = Object.assign({}, this.state.dataset_choices);
    let new_ac_datasets = Object.assign({}, this.state.new_ac_datasets);
    new_ac_datasets[dataset_id] = dataset_choices[dataset_id];
    delete dataset_choices[dataset_id];
    this.setState({
      new_ac_datasets: new_ac_datasets,
      dataset_choices: dataset_choices
    });
  }

  handleRemoveDataset = (dataset_id: number) => {
    let dataset_choices = Object.assign({}, this.state.dataset_choices);
    let new_ac_datasets = Object.assign({}, this.state.new_ac_datasets);
    dataset_choices[dataset_id] = new_ac_datasets[dataset_id];
    delete new_ac_datasets[dataset_id];
    this.setState({
      new_ac_datasets: new_ac_datasets,
      dataset_choices: dataset_choices
    });
  }

  handleAddAnnotator = (event: SyntheticEvent<HTMLInputElement>) => {
    let annotator_id = parseInt(event.currentTarget.value, 10);
    let annotator_choices = Object.assign({}, this.state.annotator_choices);
    let new_ac_annotators = Object.assign({}, this.state.new_ac_annotators);
    new_ac_annotators[annotator_id] = annotator_choices[annotator_id];
    delete annotator_choices[annotator_id];
    let annotation_goal = Math.max(1, this.state.new_ac_annotation_goal);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices,
      new_ac_annotation_goal: annotation_goal
    });
  }

  handleRemoveAnnotator = (annotator_id: number) => {
    let annotator_choices = Object.assign({}, this.state.annotator_choices);
    let new_ac_annotators = Object.assign({}, this.state.new_ac_annotators);
    annotator_choices[annotator_id] = new_ac_annotators[annotator_id];
    delete new_ac_annotators[annotator_id];
    let annotation_goal = Math.min(Object.keys(new_ac_annotators).length, this.state.new_ac_annotation_goal);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices,
      new_ac_annotation_goal: annotation_goal
    });
  }

  handleStartChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_start: event.currentTarget.value});
  }

  handleEndChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_end: event.currentTarget.value});
  }

  handleAnnotationSetChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_annotation_set: parseInt(event.currentTarget.value, 10)});
  }

  handleAnnotationGoalChange = (event: SyntheticEvent<HTMLInputElement>) => {
    let new_val = parseInt(event.currentTarget.value, 10);
    new_val = Math.max(1, new_val);
    new_val = Math.min(Object.keys(this.state.new_ac_annotators).length, new_val);
    this.setState({new_ac_annotation_goal: new_val});
  }

  handleAnnotationMethodChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_annotation_method: parseInt(event.currentTarget.value, 10)});
  }

  handleSubmit = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    this.setState({error: null});
    let res = {
      name: this.state.new_ac_name,
      desc: this.state.new_ac_desc,
      datasets: Object.keys(this.state.new_ac_datasets),
      start: this.state.new_ac_start,
      end: this.state.new_ac_end,
      annotation_set: this.state.new_ac_annotation_set,
      annotators: Object.keys(this.state.new_ac_annotators),
      annotation_goal: this.state.new_ac_annotation_goal,
      annotation_method: this.state.new_ac_annotation_method
    };
    this.postAnnotationCampaign = request.post(POST_ANNOTATION_CAMPAIGN_API_URL);
    return this.postAnnotationCampaign.set('Authorization', 'Bearer ' + this.props.app_token).send(res)
    .then(() => {
      this.props.history.push('/annotation-campaigns');
    }).catch(err => {
      if (err.status && err.status === 401) {
        // Server returned 401 which means token was revoked
        document.cookie = 'token=;max-age=0';
        window.location.reload();
      }
      else if (err.status && err.response) {
        this.setState({
          error: err
        });
      } else {
        throw err;
      }
    });
  }

  render() {
    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Create Annotation Campaign</h1>
        <br/>
        {this.state.error &&
          <p className="error-message">{this.state.error.message}</p>
        }
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <input id="cac-name" className="form-control" type="text" value={this.state.new_ac_name} onChange={this.handleNameChange} placeholder="Campaign Name" />
          </div>

          <div className="form-group">
            <textarea id="cac-desc" className="form-control" value={this.state.new_ac_desc} onChange={this.handleDescChange} placeholder="Description" />
          </div>

          <div className="form-group">
            <ListChooser choice_type="dataset" choices_list={this.state.dataset_choices} chosen_list={this.state.new_ac_datasets} onSelectChange={this.handleAddDataset} onDelClick={this.handleRemoveDataset} />
          </div>

          <div className="form-group row">
            <div className="col-sm-6">
              <input id="cac-start" className="form-control" type="text" value={this.state.new_ac_start} onChange={this.handleStartChange} placeholder="Start Date (YYYY-MM-DD)" />
            </div>
            <div className="col-sm-6">
              <input id="cac-end" className="form-control" type="text" value={this.state.new_ac_end} onChange={this.handleEndChange} placeholder="End Date (YYYY-MM-DD)" />
            </div>
          </div>

          <div className="form-group">
            <ShowAnnotationSet annotation_sets={this.state.annotation_set_choices} onChange={this.handleAnnotationSetChange} />
          </div>

          <div className="form-group">
            <label>Choose annotators:</label>
            <ListChooser choice_type="user" choices_list={this.state.annotator_choices} chosen_list={this.state.new_ac_annotators} onSelectChange={this.handleAddAnnotator} onDelClick={this.handleRemoveAnnotator} />
          </div>

          <div className="form-group row">
            <label className="col-sm-5 col-form-label">Wanted number of annotations per file:</label>
            <div className="col-sm-2">
              <input id="cac-annotation-goal" className="form-control" type="number" value={this.state.new_ac_annotation_goal} onChange={this.handleAnnotationGoalChange} />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-7 col-form-label">Wanted distribution method for files amongst annotators:</label>
            <div className="col-sm-3">
              <select id="cac-annotation-method" value={this.state.new_ac_annotation_method} className="form-control" onChange={this.handleAnnotationMethodChange}>
                <option value={-1} disabled>Select a method</option>
                <option value={0}>Random</option>
                <option value={1}>Sequential</option>
              </select>
            </div>
          </div>
          <div className="text-center">
            <input className="btn btn-primary" type="submit" value="Submit" />
          </div>
        </form>
      </div>
    );
  }
}

export default CreateAnnotationCampaign;
export { ListChooser, ShowAnnotationSet};
