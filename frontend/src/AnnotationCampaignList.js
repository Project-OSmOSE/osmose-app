// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';

if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const API_URL = process.env.REACT_APP_API_URL + '/annotation-campaign/list';

type ACLProps = {
  app_token: string
};
type ACLState = {
  annotation_campaigns: Array<{
    id: number,
    name: string,
    instructionsUrl: ?string,
    annotation_set_id: number,
    datasets_count: number,
    start: string,
    end: string,
    tasks_count: number,
    complete_tasks_count: number,
    user_tasks_count: number,
    user_complete_tasks_count: number,
  }>,
  error: ?{
    status: number,
    message: string
  }
};
class AnnotationCampaignList extends Component<ACLProps, ACLState> {
  state = {
    annotation_campaigns: [],
    error: null
  }
  getData = request.get(API_URL)

  componentDidMount() {
    return this.getData.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
      this.setState({
        annotation_campaigns: req.body
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
  }

  render() {
    if (this.state.error) {
      return (
        <div className="col-sm-9 border rounded">
          <h1>Annotation Campaigns</h1>
          <p className="error-message">{this.state.error.message}</p>
        </div>
      )
    }

    const annotation_campaigns = this.state.annotation_campaigns.map(annotation_campaign => {
      let instructions = <span>-</span>;
      if (annotation_campaign.instructionsUrl) {
        instructions = (
          <a
            href={annotation_campaign.instructionsUrl}
            title="Instructions on how to annotate tasks for this campaign"
            rel="noopener noreferrer"
            target="_blank"
          >Instructions</a>
        );
      }

      return (
        <tr key={annotation_campaign.id}>
          <td><Link to={'/annotation_campaign/' + annotation_campaign.id}>{annotation_campaign.name}</Link></td>
          <td>Set n°{annotation_campaign.annotation_set_id}</td>
          <td>{annotation_campaign.datasets_count}</td>
          <td>{new Date(annotation_campaign.start).toDateString()}</td>
          <td>{new Date(annotation_campaign.end).toDateString()}</td>
          <td>{annotation_campaign.user_complete_tasks_count} / {annotation_campaign.user_tasks_count}</td>
          <td>{instructions}</td>
          <td><Link to={'/annotation_tasks/' + annotation_campaign.id}>My tasks</Link></td>
        </tr>
      );
    });

    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Annotation Campaigns</h1>
        <p className="text-center">
          <a
            className="btn btn-warning"
            href="https://github.com/Project-ODE/FrontApp/blob/master/docs/user_guide_annotator.md"
            rel="noopener noreferrer"
            target="_blank"
          ><span className="fa fa-question-circle"></span>&nbsp;Annotator User Guide</a>
        </p>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Annotation Set</th>
              <th>Number of datasets</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Progress</th>
              <th>Campaign instructions</th>
              <th>Annotation Link</th>
            </tr>
          </thead>
          <tbody>
          {annotation_campaigns}
          </tbody>
        </table>
        <p className="text-center"><Link to="/create-annotation-campaign" className="btn btn-primary">New annotation campaign</Link></p>
      </div>
    )
  }
}

export default AnnotationCampaignList;
