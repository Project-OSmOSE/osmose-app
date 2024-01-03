import { ChangeEvent, Component, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import request, { SuperAgentRequest } from 'superagent';
import ListChooser from './ListChooser';
import type { choices_type } from './ListChooser';
import * as utils from './utils';
import { AuthService } from "./services/AuthService.tsx";

const API_URL = '/api/annotation-campaign/ID';
const USER_API_URL = '/api/user/';
const STAFF_API_URL = '/api/user/is_staff';
const POST_ANNOTATION_CAMPAIGN_API_URL = '/api/annotation-campaign/ID/add_annotators/';

type EACProps = {
  match: {
    params: {
      campaign_id: string
    }
  },
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
  isStaff: boolean,
  error?: {
    status: number,
    message: string
  }
}

class EditAnnotationCampaign extends Component<EACProps, EACState> {
  state: EACState = {
    campaign_id: 0,
    new_ac_annotators: new Map(),
    new_ac_annotation_goal: 0,
    new_ac_annotation_method: -1,
    annotator_choices: new Map(),
    isStaff: false,
    error: undefined
  }
  getData!: SuperAgentRequest;
  getUsers = request.get(USER_API_URL)
  getIsStaff = request.get(STAFF_API_URL)
  postAnnotationCampaign!: SuperAgentRequest;

  componentDidMount() {
    this.getData = request.get(API_URL.replace('ID', this.props.match.params.campaign_id));
    return Promise.all([
      this.getData.set('Authorization', AuthService.shared.bearer),
      this.getUsers.set('Authorization', AuthService.shared.bearer),
      this.getIsStaff.set('Authorization', AuthService.shared.bearer)
    ]).then(([req_data, req_users, req_is_staff]) => {
      // Find existing annotators
      const existingAnnotators = req_data.body.tasks.reduce((acc: any, curr: any) => {
        if (acc.findIndex((existing: any) => existing === curr.annotator_id) === -1) {
          acc.push(curr.annotator_id);
        }
        return acc;
      }, []);
      // Filter existing annotators from all users
      const users = req_users.body
        .filter((user: any) => existingAnnotators.findIndex((existing: any) => existing === user.id) === -1)
        .map((user: any) => { return { id: user.id, name: user.email }; });

      // Finally, set state
      this.setState({
        campaign_id: req_data.body.campaign.id,
        annotator_choices: utils.arrayToMap(users, 'id'),
        isStaff: req_is_staff.body.is_staff,
      });
    }).catch(err => {
      if (err.status && err.status === 401) {
        AuthService.shared.logout();
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
    this.postAnnotationCampaign.abort();
  }

  handleAddAnnotator = (event: ChangeEvent<HTMLSelectElement>) => {
    let annotator_id = parseInt(event.currentTarget.value, 10);
    let annotator_choices = new Map(this.state.annotator_choices);
    let new_ac_annotators = new Map(this.state.new_ac_annotators);
    new_ac_annotators.set(annotator_id, annotator_choices.get(annotator_id)!);
    annotator_choices.delete(annotator_id);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices
    });
  }

  handleRemoveAnnotator = (annotator_id: number) => {
    let annotator_choices = new Map(this.state.annotator_choices);
    let new_ac_annotators = new Map(this.state.new_ac_annotators);
    annotator_choices.set(annotator_id, new_ac_annotators.get(annotator_id)!);
    new_ac_annotators.delete(annotator_id);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices
    });
  }

  handleAnnotationGoalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const new_val = parseInt(event.currentTarget.value, 10);
    this.setState({new_ac_annotation_goal: new_val});
  }

  handleAnnotationMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({new_ac_annotation_method: parseInt(event.currentTarget.value, 10)});
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({error: undefined});

    // Build request body
    const params = {
      annotators: Array.from(this.state.new_ac_annotators.keys()),
      annotation_method: this.state.new_ac_annotation_method,
    };
    const annotation_goal = this.state.new_ac_annotation_goal === 0 ?
      undefined : { annotation_goal: this.state.new_ac_annotation_goal};
    const res = Object.assign({}, params, annotation_goal);

    const postUrl = POST_ANNOTATION_CAMPAIGN_API_URL.replace('ID', this.state.campaign_id.toFixed());
    this.postAnnotationCampaign = request.post(postUrl);
    return this.postAnnotationCampaign.set('Authorization', AuthService.shared.bearer)
      .send(res)
      .then(() => {
        this.props.history.push(`/annotation_campaign/${this.state.campaign_id.toFixed()}`);
      }).catch(err => {
        if (err.status && err.status === 401) {
          AuthService.shared.logout();
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

  renderForm() {
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
            <label className="col-sm-5 col-form-label">Wanted number of files to annotate<br />(0 for all files):</label>
            <div className="col-sm-2">
              <input id="cac-annotation-goal" className="form-control" type="number" min={0} value={this.state.new_ac_annotation_goal} onChange={this.handleAnnotationGoalChange} />
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

  render() {
    if (this.state.isStaff) {
      if (this.state.annotator_choices.size > 0 || this.state.new_ac_annotators.size > 0) {
        return this.renderForm();
      } else {
        return (
          <div className="col-sm-9 border rounded">
            <h1 className="text-center">Edit Annotation Campaign</h1>
            <br/>
            <p className="alert alert-info">Every possible annotator has been added to this campaign. If you want to create new users, use the administration backend.</p>
            <br />
            <p className="text-center"><Link to={'/annotation_campaign/' + this.state.campaign_id.toFixed()}>Go back to annotation campaign details</Link></p>
          </div>
        );
      }
    } else {
      return (
        <div className="col-sm-9 border rounded">
          <h1 className="text-center">Edit Annotation Campaign</h1>
          <br/>
          <p className="error-message">You are not allowed to access this page</p>
        </div>
      );
    }
  }
}

export default EditAnnotationCampaign;
