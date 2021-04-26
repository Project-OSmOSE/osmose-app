// @flow
import React, { Component } from 'react';
import request from 'superagent';

if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const API_URL = process.env.REACT_APP_API_URL + '/annotation-campaign/';
const USER_API_URL = process.env.REACT_APP_API_URL + '/user/list';
const REPORT_API_URL = process.env.REACT_APP_API_URL + '/annotation-campaign/report/';

type DownloadButtonProps = {
  url: string,
  app_token: string,
  filename: string,
  value: string
};
class DownloadButton extends Component<DownloadButtonProps> {
  getDownload = request.get(this.props.url)
  url = ''

  componentWillUnmount() {
    this.getDownload.abort();
    URL.revokeObjectURL(this.url);
  }

  onClick = () => {
    return this.getDownload
    .set('Authorization', 'Bearer ' + this.props.app_token)
    .then(res => {
      this.url = URL.createObjectURL(new File([res.text], this.props.filename, {type : res.header['content-type']}));
      // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
      let a = document.createElement('a');
      a.style.display = "none";
      a.href = this.url;
      a.type = res.header['content-type'];
      a.download = this.props.filename;
      if (!document.body) throw new Error("Unexpectedly missing <body>");
      document.body.appendChild(a);
      a.click();
    })
  }

  render() {
    return (
      <button onClick={this.onClick} className="btn btn-primary">{this.props.value}</button>
    );
  }
}

type ACDProps = {
  match: {
    params: {
      campaign_id: number
    }
  },
  app_token: string
};
type ACDState = {
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
  tasks: Array<{
    annotator_id: number,
    annotator_name: string,
    progress: string
  }>,
  error: ?{
    status: number,
    message: string
  }
};
class AnnotationCampaignDetail extends Component<ACDProps, ACDState> {
  state = {
    campaign: null,
    tasks: [],
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
        document.cookie = 'token=;max-age=0';
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

  render() {
    let annotation_tasks = this.state.tasks.map(task => {
      return (
        <tr key={task.annotator_id}>
          <td>{task.annotator_name}</td>
          <td>{task.progress}</td>
        </tr>
      );
    });

    if (this.state.error) {
      return (
        <div className="col-sm-9 border rounded">
          <h1>Annotation Campaign</h1>
          <p className="error-message">{this.state.error.message}</p>
        </div>
      )
    }

    if (!this.state.campaign) {
      return (
        <div className="col-sm-9 border rounded">
          <h6>Loading Annotation Campaign ...</h6>
        </div>
      )
    }

    let { campaign } = this.state;
    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">{campaign.name}</h1>
        <div className="row">
          <div className="col-sm-4"><b>Annotation set:</b> #{campaign.annotation_set_id}</div>
          <div className="col-sm-4"><b>Start:</b> {new Date(campaign.start).toLocaleDateString()}</div>
          <div className="col-sm-4"><b>End:</b> {new Date(campaign.end).toLocaleDateString()}</div>
        </div>
        <div className="col-sm-12 border rounder">
          <center><h3>Description</h3></center>
          {campaign.desc}
        </div>
        <br />
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Annotator</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
          {annotation_tasks}
          </tbody>
        </table>
        <p className="text-center">
          <DownloadButton
            app_token={this.props.app_token}
            url={REPORT_API_URL + this.props.match.params.campaign_id}
            value={"Download CSV results"}
            filename={campaign.name.replace(' ', '_') + '.csv'}
          />
        </p>
      </div>
    )
  }
}

export default AnnotationCampaignDetail;
export { DownloadButton };
