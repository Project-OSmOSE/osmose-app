// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';

// API constants
if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const CAMPAIGN_API_URL = process.env.REACT_APP_API_URL + '/annotation-campaign/';
const TASKS_API_URL = process.env.REACT_APP_API_URL + '/annotation-task/campaign/ID/my-list';

const TASK_STATUS_FINISHED = 2;


type AnnotationTaskListProps = {
  match: {
    params: {
      campaign_id: number
    }
  },
  app_token: string
};

type AnnotationTaskListState = {
  campaign: ?{
    id: number,
    name: string,
    desc: string,
    start: string,
    end: string,
    annotation_set_id: number,
    owner_id: number,
    instructionsUrl: ?string,
  },
  annotation_tasks: Array<{
    id: number,
    status: number,
    filename: string,
    dataset_name: string,
    start: string,
    end: string,
  }>,
  error: ?{
    status: number,
    message: string
  }
};

class AnnotationTaskList extends Component<AnnotationTaskListProps, AnnotationTaskListState> {
  state = {
    campaign: null,
    annotation_tasks: [],
    error: null
  }
  getCampaign = request.get(CAMPAIGN_API_URL);
  getTasks = request.get(TASKS_API_URL);

  componentDidMount() {
    let campaignID = this.props.match.params.campaign_id.toString();
    this.getCampaign = request.get(CAMPAIGN_API_URL + campaignID);
    this.getTasks = request.get(TASKS_API_URL.replace('ID', campaignID));

    return Promise.all([
      this.getCampaign.set('Authorization', 'Bearer ' + this.props.app_token),
      this.getTasks.set('Authorization', 'Bearer ' + this.props.app_token),
    ]).then(([req_campaign, req_tasks]) => {
      this.setState({
        campaign: req_campaign.body.campaign,
        annotation_tasks: req_tasks.body,
      });
    }).catch(err => {
      if (err.status && err.status === 401) {
        // Server returned 401 which means token was revoked
        document.cookie = 'token=;max-age=0';
        window.location.reload();
      } else if (err.status && err.status === 404 && err.response) {
        err.message = err.response.body.detail;
      }
      this.setState({
        error: err
      });
    });
  }

  componentWillUnmount() {
    this.getCampaign.abort();
    this.getTasks.abort();
  }

  render() {
    if (this.state.error) {
      return (
        <div className="col-sm-9 border rounded">
          <h1>Annotation Tasks</h1>
          <p className="error-message">{this.state.error.message}</p>
        </div>
      )
    }

    const annotation_tasks = this.state.annotation_tasks.map(annotation_task => {
      let start_date = new Date(annotation_task.start);
      let diff_time = new Date(new Date(annotation_task.end) - start_date);
      let status_names = ['Created', 'Started', 'Finished'];
      return (
        <tr
          className={annotation_task.status === TASK_STATUS_FINISHED ? 'table-success' : 'table-warning'}
          key={annotation_task.id}
        >
          <td>{annotation_task.filename}</td>
          <td>{annotation_task.dataset_name}</td>
          <td>{start_date.toLocaleDateString()}</td>
          <td>{diff_time.toUTCString().split(' ')[4]}</td>
          <td>{status_names[annotation_task.status]}</td>
          <td><Link to={'/audio-annotator/' + annotation_task.id}>Task link</Link></td>
        </tr>
      );
    });

    let instructions = undefined;
    if (this.state.campaign && this.state.campaign.instructionsUrl) {
      instructions = (
        <a
          className="btn btn-warning"
          href={this.state.campaign.instructionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        ><span className="fa fa-info-circle"></span>&nbsp;Campaign instructions</a>
      );
    }

    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Annotation Tasks</h1>
        <p className="text-center">
          <a
            className="btn btn-warning"
            href="https://github.com/Project-ODE/FrontApp/blob/master/docs/user_guide_annotator.md"
            rel="noopener noreferrer"
            target="_blank"
          ><span className="fa fa-question-circle"></span>&nbsp;Annotator User Guide</a>
          &nbsp;
          {instructions}
        </p>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Dataset</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {annotation_tasks}
          </tbody>
        </table>
      </div>
    )
  }
}

export default AnnotationTaskList;
