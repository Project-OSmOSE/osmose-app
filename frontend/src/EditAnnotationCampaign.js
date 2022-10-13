// @flow

import React, { Component } from 'react';
import request from 'superagent';
import ListChooser, { choices_type } from './ListChooser';

const API_URL = '/api/annotation-campaign/';
const USER_API_URL = '/api/user/';

type EACProps = {
  app_token: String,
  history: {
    push: (url: string) => void
  }
}

type EACState = {
  new_ac_annotators: choices_type,
  annotator_choices: choices_type,
  error: ?{
    status: number,
    message: string
  }
}

class EditAnnotationCampaign extends Component<EACProps, EACState> {
  state = {
    new_ac_annotators: {},
    annotator_choices: {},
    error: null 
  }
  getData = { abort: () => null }
  getUsers = request.get(USER_API_URL)

  componentDidMount() {
    this.getData = request.get(API_URL + this.props.match.params.campaign_id);
    return Promise.all([
      this.getData.set('Authorization', 'Bearer ' + this.props.app_token),
      this.getUsers.set('Authorization', 'Bearer ' + this.props.app_token)
    ]).then(([req_data, req_users]) => {
      let users = {};
      req_users.body.forEach(user => {
        users[user.id] = user.email;
      })
      let tmp_tasks = {};
      req_data.body.tasks.forEach(task => {
        if (!tmp_tasks[task.annotator_id]) {
          tmp_tasks[task.annotator_id] = {};
        }
        tmp_tasks[task.annotator_id][task.status] = task.count;
      })
      let tasks = [];
      Object.keys(tmp_tasks).forEach(key => {
        let val = tmp_tasks[key];
        let total = Object.values(val).map(v => { return parseInt(v, 10); }).reduce((a, b) => a + b, 0);
        let progress = (val[2] || 0).toString() + '/' + total.toString();
        tasks.push({ annotator_id: parseInt(key, 10), annotator_name: users[key], progress: progress });
      });
      this.setState({
        campaign: req_data.body.campaign,
        tasks: tasks
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

          <div className="text-center">
            <input className="btn btn-primary" type="submit" value="Submit" />
          </div>
        </form>
      </div>
    )
  }
}

export default EditAnnotationCampaign;
