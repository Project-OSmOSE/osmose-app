// @flow

import React, { Component } from 'react';
import request from 'superagent';
import ListChooser, { choices_type } from './ListChooser';
import * as utils from './utils';

const API_URL = '/api/annotation-campaign/';
const USER_API_URL = '/api/user/';

type EACProps = {
  match: {
    params: {
      campaign_id: number
    }
  },
  app_token: String,
  history: {
    push: (url: string) => void
  }
}

type EACState = {
  campaign_id: number,
  new_ac_annotators: choices_type,
  new_ac_annotation_goal: number,
  new_ac_annotation_method: number,
  annotator_choices: choices_type,
  error: ?{
    status: number,
    message: string
  }
}

class EditAnnotationCampaign extends Component<EACProps, EACState> {
  state = {
    campaign_id: 0,
    new_ac_annotators: {},
    new_ac_annotation_goal: 0,
    new_ac_annotation_method: -1,
    annotator_choices: {},
    error: null 
  }
  getData = { abort: () => null }
  getUsers = request.get(USER_API_URL)
  postAnnotationCampaign = { abort: () => null }

  componentDidMount() {
    this.getData = request.get(API_URL + this.props.match.params.campaign_id);
    return Promise.all([
      this.getData.set('Authorization', 'Bearer ' + this.props.app_token),
      this.getUsers.set('Authorization', 'Bearer ' + this.props.app_token)
    ]).then(([req_data, req_users]) => {
      // Find existing annotators
      const existingAnnotators = req_data.body.tasks.reduce((acc, curr) => {
        if (acc.findIndex(existing => existing === curr.annotator_id) === -1) {
          acc.push(curr.annotator_id);
        }
        return acc;
      }, []);
      // Filter existing annotators from all users
      const users = req_users.body
        .filter(user => existingAnnotators.findIndex(existing => existing === user.id) === -1)
        .map(user => { return { id: user.id, name: user.email }; });
      // Finally, set state
      this.setState({
        campaign_id: req_data.body.campaign.id,
        annotator_choices: utils.arrayToObject(users, 'id'),
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
    });
  }

  componentWillUnmount() {
    this.getData.abort();
    this.getUsers.abort();
    this.postAnnotationCampaign.abort();
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
    const res = {
      annotators: Object.keys(this.state.new_ac_annotators),
      annotation_goal: this.state.new_ac_annotation_goal,
      annotation_method: this.state.new_ac_annotation_method,
    };
    const postUrl = `/api/annotation-campaign/${this.state.campaign_id.toFixed()}/add_annotators/`;
    this.postAnnotationCampaign = request.post(postUrl);
    return this.postAnnotationCampaign.set('Authorization', 'Bearer ' + this.props.app_token)
      .send(res)
      .then(() => {
        this.props.history.push(`/annotation_campaign/${this.state.campaign_id.toFixed()}`);
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
    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Edit Annotation Campaign</h1>
        <br/>
        {this.state.error &&
          <p className="error-message">{this.state.error.message}</p>
        }
        <form onSubmit={this.handleSubmit}>
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

export default EditAnnotationCampaign;
