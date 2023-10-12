// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';

const API_URL = '/api/annotation-campaign/ID';
const USER_API_URL = '/api/user/';
const STAFF_API_URL = '/api/user/is_staff';
const REPORT_API_URL = '/api/annotation-campaign/ID/report/';
const STATUS_REPORT_API_URL = '/api/annotation-campaign/ID/report_status/';

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
    instructions_url: ?string,
  },
  tasks: Array<{
    annotator_id: number,
    annotator_name: string,
    progress: string
  }>,
  isStaff: boolean,
  error: ?{
    status: number,
    message: string
  }
};
class AnnotationCampaignDetail extends Component<ACDProps, ACDState> {
  state = {
    campaign: null,
    tasks: [],
    isStaff: false,
    error: null
  }
  getData = { abort: () => null }
  getUsers = request.get(USER_API_URL)
  getIsStaff = request.get(STAFF_API_URL)

  componentDidMount() {
    this.getData = request.get(API_URL.replace('ID', this.props.match.params.campaign_id.toString()));
    return Promise.all([
      this.getData.set('Authorization', 'Bearer ' + this.props.app_token),
      this.getUsers.set('Authorization', 'Bearer ' + this.props.app_token),
      this.getIsStaff.set('Authorization', 'Bearer ' + this.props.app_token)
    ]).then(([req_data, req_users, req_is_staff]) => {
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
        tasks: tasks,
        isStaff: req_is_staff.body.is_staff
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
    this.getIsStaff.abort();
  }

  renderAddAnnotatorButton(isStaff: boolean, campaignId: number) {
    if (isStaff) {
      return (
        <p className="text-center">
          <Link to={'/annotation_campaign/' + campaignId + '/edit'} className="btn btn-primary">Add annotators</Link>
        </p>
      );
    }
  }

  render() {
    let annotation_tasks = this.state.tasks.map(task => {
      return (
        <tr key={task.annotator_id}>
          <td className="text-center">{task.annotator_name}</td>
          <td className="text-center">{task.progress}</td>
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
        <div className="row justify-content-around">
          <div>
            <div><b>Annotation set:</b> #{campaign.annotation_set_id}</div>
          </div>
          <div>
            <div><b>Created at:</b> {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}</div>
            <div><b>Start:</b> {campaign.start ? new Date(campaign.start).toLocaleDateString() : 'N/A'}</div>
            <div><b>End:</b> {campaign.end ? new Date(campaign.end).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>
        <div className="col-sm-12 border rounder">
          <center><h3>Description</h3></center>
          {campaign.desc}
        </div>
        <br />
        {this.renderAddAnnotatorButton(this.state.isStaff, campaign.id)}
        <table className="table table-bordered">
          <thead className="text-center">
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
            url={REPORT_API_URL.replace('ID', this.props.match.params.campaign_id.toString())}
            value={"Download CSV results"}
            filename={campaign.name.replace(' ', '_') + '_results.csv'}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <DownloadButton
            app_token={this.props.app_token}
            url={STATUS_REPORT_API_URL.replace('ID', this.props.match.params.campaign_id.toString())}
            value={"Download CSV task status"}
            filename={campaign.name.replace(' ', '_') + '_task_status.csv'}
          />
        </p>
      </div>
    )
  }
}

export default AnnotationCampaignDetail;
export { DownloadButton };
