// @flow

import React, { Component } from 'react';
import request from 'superagent';
import ListChooser from './ListChooser';
import type { choices_type } from './ListChooser';
import * as utils from './utils';

const GET_DATASETS_API_URL = '/api/dataset/';
const GET_ANNOTATION_SETS_API_URL = '/api/annotation-set/';
const GET_USERS_API_URL = '/api/user/';
const POST_ANNOTATION_CAMPAIGN_API_URL = '/api/annotation-campaign/';

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
  new_ac_spectros: choices_type,
  new_ac_start: string,
  new_ac_end: string,
  new_ac_annotation_set: number,
  new_ac_annotation_mode: number,
  new_ac_annotators: choices_type,
  new_ac_annotation_goal: number,
  new_ac_annotation_method: number,
  dataset_choices: choices_type,
  spectro_choices: choices_type,
  annotation_set_choices: {
    [?number]: annotation_set_type
  },
  annotator_choices: choices_type,
  new_ac_instructions_url: string,
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
    new_ac_spectros: {},
    new_ac_start: '',
    new_ac_end: '',
    new_ac_annotation_set: 0,
    new_ac_annotators: {},
    new_ac_annotation_goal: 0,
    new_ac_annotation_method: -1,
    new_ac_annotation_mode: 1,
    dataset_choices: {},
    spectro_choices: {},
    annotation_set_choices: {},
    annotator_choices: {},
    new_ac_instructions_url: '',
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
        let datasets = req.body.filter(dataset => { return dataset.files_type === '.wav'});
        this.setState({
          dataset_choices: utils.arrayToObject(datasets, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
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
          document.cookie = 'token=;max-age=0;path=/';
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
          document.cookie = 'token=;max-age=0;path=/';
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

  handleDatasetChanged = (event: SyntheticInputEvent<HTMLSelectElement>) => {
    let new_ac_datasets = {};
    let spectro_choices = {};
    if (event.target.value !== '') {
      let dataset_id = parseInt(event.target.value, 10);
      new_ac_datasets[dataset_id] = this.state.dataset_choices[dataset_id];
      spectro_choices = utils.arrayToObject(new_ac_datasets[dataset_id].spectros, 'id');
    }
    this.setState({
      new_ac_datasets: new_ac_datasets,
      spectro_choices: spectro_choices,
      new_ac_spectros: {},
    });
  }

  handleAddSpectro = (event: SyntheticEvent<HTMLInputElement>) => {
    let spectro_id = parseInt(event.currentTarget.value, 10);
    let spectro_choices = Object.assign({}, this.state.spectro_choices);
    let new_ac_spectros = Object.assign({}, this.state.new_ac_spectros);
    new_ac_spectros[spectro_id] = spectro_choices[spectro_id];
    delete spectro_choices[spectro_id];
    this.setState({
      new_ac_spectros: new_ac_spectros,
      spectro_choices: spectro_choices,
    });
  }

  handleRemoveSpectro = (spectro_id: number) => {
    let spectro_choices = Object.assign({}, this.state.spectro_choices);
    let new_ac_spectros = Object.assign({}, this.state.new_ac_spectros);
    spectro_choices[spectro_id] = new_ac_spectros[spectro_id];
    delete new_ac_spectros[spectro_id];
    this.setState({
      new_ac_spectros: new_ac_spectros,
      spectro_choices: spectro_choices,
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

  handleInstructionsChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_instructions_url: event.currentTarget.value});
  }

  handleAnnotationSetChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_annotation_set: parseInt(event.currentTarget.value, 10)});
  }

  handleAnnotationModeChange =(event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({new_ac_annotation_mode: parseInt(event.currentTarget.value, 10)});
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
      name: this.state.new_ac_name.trim() || 'Unnamed Campaign',
      desc: this.state.new_ac_desc.trim(),
      datasets: Object.keys(this.state.new_ac_datasets),
      spectros: Object.keys(this.state.new_ac_spectros),
      annotation_set_id: this.state.new_ac_annotation_set,
      annotation_scope: this.state.new_ac_annotation_mode,
      annotators: Object.keys(this.state.new_ac_annotators),
      annotation_goal: this.state.new_ac_annotation_goal,
      annotation_method: this.state.new_ac_annotation_method,
      instructions_url: this.state.new_ac_instructions_url.trim(),
    }
    const start: ?string = this.state.new_ac_start ? this.state.new_ac_start.trim() + 'T00:00' : undefined;
    const end: ?string = this.state.new_ac_end ? this.state.new_ac_end.trim() + 'T00:00' : undefined;
    res = Object.assign({}, res, {start, end});
    this.postAnnotationCampaign = request.post(POST_ANNOTATION_CAMPAIGN_API_URL);
    return this.postAnnotationCampaign.set('Authorization', 'Bearer ' + this.props.app_token).send(res)
    .then(() => {
      this.props.history.push('/annotation-campaigns');
    }).catch(err => {
      if (err.status && err.status === 401) {
        // Server returned 401 which means token was revoked
        document.cookie = 'token=;max-age=0;path=/';
        window.location.reload();
      }
      else if (err.status && err.response) {
        // Build an error message
        const message = Object
          .entries(err.response.body)
          .map(([key, value]) => Array.isArray(value) ? `${key}: ${value.join(' - ')}` : '')
          .join("\n");
        this.setState({
          error: {
            status: err.status,
            message: message
          }
        });
      } else {
        throw err;
      }
    });
  }

  render() {
    const datasetOptions = utils.objectValues(this.state.dataset_choices).map(dataset => (
      <option key={`dataset-${dataset.id}`} value={dataset.id.toString()}>{dataset.name}</option>
    ));
    let wanted_annotions_label
    const total_annotator = Object.keys(this.state.new_ac_annotators).length
    if (Object.keys(this.state.new_ac_datasets).length !== 0 && total_annotator !== 0) {
      let file_count = this.state.new_ac_datasets[1].files_count
      let total_goal = file_count*this.state.new_ac_annotation_goal
      let annotator_goal, remainder, files_target
      [annotator_goal, remainder] = utils.divmod(total_goal, total_annotator)
      let total_files_by_annotator = []
      let annotator_need_files = total_annotator
      while(annotator_need_files > 0) {
        files_target = annotator_goal
        if (remainder > 0) {
          files_target +=
          remainder-=1
        }
        total_files_by_annotator[annotator_need_files-1] = files_target
        annotator_need_files -= 1
      }
      const  sum_total_files_by_annotator = total_files_by_annotator.reduce((accumulator, currentValue) => { return accumulator + currentValue; })
      const files_annotate_in_average = Math.round(sum_total_files_by_annotator / total_annotator)
      wanted_annotions_label = `Each annotator will annotate at least ${files_annotate_in_average} files in the campaign (${Math.round(files_annotate_in_average/this.state.new_ac_datasets[1].files_count*100)}%), which contains ${this.state.new_ac_datasets[1].files_count} files in total`
    } else {
      wanted_annotions_label =""
    }

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
            <select
              id="cac-dataset"
              className="form-control"
              onChange={this.handleDatasetChanged}
            >
              <option key="dataset-void" value="">Select a dataset</option>
              {datasetOptions}
            </select>
          </div>

          <div className="form-group">
            <ListChooser
              choice_type="spectro"
              choices_list={this.state.spectro_choices}
              chosen_list={this.state.new_ac_spectros}
              onSelectChange={this.handleAddSpectro}
              onDelClick={this.handleRemoveSpectro}
            />
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
            <label className="col-sm-7 col-form-label">Annotation mode</label>
            <select
              id="cac-annotation-mode"
              value={this.state.new_ac_annotation_mode}
              className="form-control"
              onChange={this.handleAnnotationModeChange}
            >
              <option value={1}>Boxes</option>
              <option value={2}>Whole file</option>
            </select>
          </div>

          <div className="form-group">
            <label>Choose annotators:</label>
            <ListChooser choice_type="user" choices_list={this.state.annotator_choices} chosen_list={this.state.new_ac_annotators} onSelectChange={this.handleAddAnnotator} onDelClick={this.handleRemoveAnnotator} />
          </div>

          <div className="form-group">
            <input id="cac-instructions" className="form-control" type="text" value={this.state.new_ac_instructions_url} onChange={this.handleInstructionsChange} placeholder="Campaign instructions URL" />
          </div>

          <div className="form-group row">
            <label className="col-sm-5 col-form-label">Wanted number of annotators per file:</label>
            <div className="col-sm-2">
              <input id="cac-annotation-goal" className="form-control" type="number" min={0} value={this.state.new_ac_annotation_goal} onChange={this.handleAnnotationGoalChange} />
            </div>
            <p className="col-sm-5">{wanted_annotions_label}</p>
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
export { ShowAnnotationSet};
