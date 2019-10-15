// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';

// API constants
if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const API_URL = process.env.REACT_APP_API_URL + '/annotation-task/campaign/ID/my-list';

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
    annotation_tasks: [],
    error: null
  }
  getData = { abort: () => null }

  componentDidMount() {
    let campaignID = this.props.match.params.campaign_id.toString();
    this.getData = request.get(API_URL.replace('ID', campaignID));
    return this.getData.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
      this.setState({
        annotation_tasks: req.body
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
    this.getData.abort();
  }

  render() {
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

    if(this.state.error) {
      return (
        <div className="col-sm-9 border rounded">
          <h1>Annotation Tasks</h1>
          <p className="error-message">{this.state.error.message}</p>
        </div>
      )
    }

    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Annotation Tasks</h1>
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
