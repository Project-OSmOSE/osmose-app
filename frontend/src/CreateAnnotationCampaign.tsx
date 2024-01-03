import { ChangeEvent, Component, FormEvent } from 'react';
import request, { SuperAgentRequest } from 'superagent';
import ListChooser from './ListChooser';
import type { choices_type } from './ListChooser';
import * as utils from './utils';
import { AuthService } from "./services/AuthService.tsx";

const GET_DATASETS_API_URL = '/api/dataset/';
const GET_ANNOTATION_SETS_API_URL = '/api/annotation-set/';
const GET_USERS_API_URL = '/api/user/';
const GET_CONFIDENCE_INDICATORS_API_URL = '/api/confidence-indicator/';
const POST_ANNOTATION_CAMPAIGN_API_URL = '/api/annotation-campaign/';

type annotation_set_type = {
  id: number,
  name: string,
  desc: string,
  tags: Array<string>
};

type ShowAnnotationSetProps = {
  annotation_sets: Map<number, annotation_set_type>,
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
};

type ShowAnnotationSetState = {
  selected_id: number,
  selected?: annotation_set_type
};

class ShowAnnotationSet extends Component<ShowAnnotationSetProps, ShowAnnotationSetState> {
  state: ShowAnnotationSetState = {
    selected_id: 0,
    selected: undefined
  }

  handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    let id = parseInt(event.currentTarget.value, 10);
    this.setState({
      selected_id: id,
      selected: this.props.annotation_sets.get(id)
    });
    this.props.onChange(event);
  }

  render() {
    let options = Array.from(this.props.annotation_sets.values()).map(annotation_set => {
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

type confidence_indicator_set_type = {
  id: number,
  name: string,
  desc: string,
  confidence_indicators: Array<string>,
  default_confidence_indicator: number,
};

type ShowConfidenceIndicatorSetProps = {
  confidence_indicator_sets: Map<number, confidence_indicator_set_type>,
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
};

type ShowConfidenceIndicatorSetState = {
  selected_id: number,
  selected?: confidence_indicator_set_type
};
class ShowConfidenceIndicatorSet extends Component<ShowConfidenceIndicatorSetProps, ShowConfidenceIndicatorSetState> {
  state: ShowConfidenceIndicatorSetState = {
    selected_id: 0,
    selected: undefined
  }

  handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.currentTarget.value === "no-confidence-indicator-set") {
      this.setState({
        selected_id: 0,
        selected: undefined
      });
    } else {
      let id = parseInt(event.currentTarget.value, 10);
      this.setState({
        selected_id: id,
        selected: this.props.confidence_indicator_sets.get(id)
      });
    }
    this.props.onChange(event);
  }

  render() {
    let options = Array.from(this.props.confidence_indicator_sets.values()).map(confidence_indicator_set => {
      return (
        <option key={confidence_indicator_set.id} value={confidence_indicator_set.id}>{confidence_indicator_set.name}</option>
      );
    });

    return (
      <div className="form-group">
        <div className="col-sm-4 offset-sm-4">
          <select id="cac-confidence-indicator-set" value={this.state.selected_id} className="form-control" onChange={this.handleOnChange}>
            <option value={0} disabled>Select a confidence indicator set</option>
            <option key="null-confidence-indicators" value="no-confidence-indicator-set">No Confidence Indicator Set</option>
            {options}
          </select>
        </div>
        {this.state.selected &&
          <div className="col-sm-12 border rounded">
            <p>{this.state.selected.desc}</p>
            {this.state.selected.confidence_indicators.map((confidence_indicator: any) => { console.log("confidence_indicator", confidence_indicator); // TODO HERE
              return (
                <p key={"confidence" + confidence_indicator.level + "_" + confidence_indicator.label}><b>{confidence_indicator.level}: </b> {confidence_indicator.label}</p>
              )
            })}
          </div>
        }
      </div>
    )
  }
}

type CACProps = {
  history: {
    push: (url: string) => void
  }
};

type CACState = {
  new_ac_name: string,
  new_ac_desc: string,
  new_ac_dataset: any, // TODO HERE
  new_ac_spectros: choices_type,
  new_ac_start: string,
  new_ac_end: string,
  new_ac_annotation_set: number,
  new_ac_annotation_mode: number,
  new_ac_annotators: choices_type,
  new_ac_annotation_goal: number,
  new_ac_annotation_method: number,
  new_ac_confidence_indicator_set?: number,
  dataset_choices: choices_type,
  spectro_choices: choices_type,
  confidence_indicator_set_choices: Map<number, confidence_indicator_set_type>,
  annotation_set_choices: Map<number, annotation_set_type>,
  annotator_choices: choices_type,
  new_ac_instructions_url: string,
  error?: {
    status: number,
    message: string
  }
};

class CreateAnnotationCampaign extends Component<CACProps, CACState> {
  state: CACState = {
    new_ac_name: '',
    new_ac_desc: '',
    new_ac_dataset: {}, // TODO HERE
    new_ac_spectros: new Map(),
    new_ac_start: '',
    new_ac_end: '',
    new_ac_annotation_set: 0,
    new_ac_confidence_indicator_set: undefined,
    new_ac_annotators: new Map(),
    new_ac_annotation_goal: 0,
    new_ac_annotation_method: -1,
    new_ac_annotation_mode: 1,
    dataset_choices: new Map(),
    spectro_choices: new Map(),
    confidence_indicator_set_choices: new Map(),
    annotation_set_choices: new Map(),
    annotator_choices: new Map(),
    new_ac_instructions_url: '',
    error: undefined
  }
  getDatasets = request.get(GET_DATASETS_API_URL)
  getAnnotationSets = request.get(GET_ANNOTATION_SETS_API_URL)
  getUsers = request.get(GET_USERS_API_URL)
  getConfidenceSets = request.get(GET_CONFIDENCE_INDICATORS_API_URL)
  postAnnotationCampaign!: SuperAgentRequest;

  componentDidMount() {
    // TODO the following error handling is very messy
    // This should be fixed in a future rework of API calls
    return Promise.all([
      this.getDatasets.set('Authorization', AuthService.shared.bearer).then(req => {
        let datasets = req.body.filter((dataset: any) => { return dataset.files_type === '.wav'});
        this.setState({
          dataset_choices: utils.arrayToMap(datasets, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          AuthService.shared.logout();
        }
        this.setState({
          error: err
        });
      }),
      this.getAnnotationSets.set('Authorization', AuthService.shared.bearer).then(req => {
        this.setState({
          annotation_set_choices: utils.arrayToMap(req.body, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          AuthService.shared.logout();
        }
        this.setState({
          error: err
        });
      }),
      this.getConfidenceSets.set('Authorization', AuthService.shared.bearer).then(req => {
        this.setState({
          confidence_indicator_set_choices: utils.arrayToMap(req.body, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          AuthService.shared.logout();
        }
        this.setState({
          error: err
        });
      }),
      this.getUsers.set('Authorization', AuthService.shared.bearer).then(req => {
        let users = req.body.map((user: any) => { return { id: user.id, name: user.email }; });
        this.setState({
          annotator_choices: utils.arrayToMap(users, 'id')
        });
      }).catch(err => {
        if (err.status && err.status === 401) {
          AuthService.shared.logout();
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

  handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({new_ac_name: event.currentTarget.value});
  }

  handleDescChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({new_ac_desc: event.currentTarget.value});
  }

  handleDatasetChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    let new_ac_dataset: any; // TODO HERE
    let spectro_choices: choices_type = new Map();
    if (event.target.value !== '') {
      let dataset_id = parseInt(event.target.value, 10);
      new_ac_dataset = this.state.dataset_choices.get(dataset_id)!;
      spectro_choices = utils.arrayToMap(new_ac_dataset.spectros, 'id'); // TODO HERE
    }
    this.setState({
      new_ac_dataset: new_ac_dataset,
      spectro_choices: spectro_choices,
      new_ac_spectros: new Map(),
    });
  }

  handleAddSpectro = (event: ChangeEvent<HTMLSelectElement>) => {
    let spectro_id = parseInt(event.currentTarget.value, 10);
    let spectro_choices = new Map(this.state.spectro_choices);
    let new_ac_spectros = new Map(this.state.new_ac_spectros);
    new_ac_spectros.set(spectro_id, spectro_choices.get(spectro_id)!);
    spectro_choices.delete(spectro_id);
    this.setState({
      new_ac_spectros: new_ac_spectros,
      spectro_choices: spectro_choices,
    });
  }

  handleRemoveSpectro = (spectro_id: number) => {
    let spectro_choices = new Map(this.state.spectro_choices);
    let new_ac_spectros = new Map(this.state.new_ac_spectros);
    spectro_choices.set(spectro_id, new_ac_spectros.get(spectro_id)!);
    new_ac_spectros.delete(spectro_id);
    this.setState({
      new_ac_spectros: new_ac_spectros,
      spectro_choices: spectro_choices,
    });
  }

  handleAddAnnotator = (event: ChangeEvent<HTMLSelectElement>) => {
    let annotator_id = parseInt(event.currentTarget.value, 10);
    let annotator_choices = new Map(this.state.annotator_choices);
    let new_ac_annotators = new Map(this.state.new_ac_annotators);
    new_ac_annotators.set(annotator_id, annotator_choices.get(annotator_id)!);
    annotator_choices.delete(annotator_id);
    let annotation_goal = Math.max(1, this.state.new_ac_annotation_goal);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices,
      new_ac_annotation_goal: annotation_goal
    });
  }

  handleRemoveAnnotator = (annotator_id: number) => {
    let annotator_choices = new Map(this.state.annotator_choices);
    let new_ac_annotators = new Map(this.state.new_ac_annotators);
    annotator_choices.set(annotator_id, new_ac_annotators.get(annotator_id)!);
    new_ac_annotators.delete(annotator_id);
    let annotation_goal = Math.min(new_ac_annotators.size, this.state.new_ac_annotation_goal);
    this.setState({
      new_ac_annotators: new_ac_annotators,
      annotator_choices: annotator_choices,
      new_ac_annotation_goal: annotation_goal
    });
  }

  handleStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({new_ac_start: event.currentTarget.value});
  }

  handleEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({new_ac_end: event.currentTarget.value});
  }

  handleInstructionsChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({new_ac_instructions_url: event.currentTarget.value});
  }

  handleAnnotationSetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({new_ac_annotation_set: parseInt(event.currentTarget.value, 10)});
  }

  handleConfidenceSetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    let newValue = undefined;
    if (event.currentTarget.value !== "no-confidence-indicator-set") {
      newValue = parseInt(event.currentTarget.value, 10)
    }

    this.setState({ new_ac_confidence_indicator_set: newValue });
  }

  handleAnnotationModeChange =(event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({new_ac_annotation_mode: parseInt(event.currentTarget.value, 10)});
  }

  handleAnnotationGoalChange = (event: ChangeEvent<HTMLInputElement>) => {
    let new_val = parseInt(event.currentTarget.value, 10);
    new_val = Math.max(1, new_val);
    new_val = Math.min(this.state.new_ac_annotators.size, new_val);
    this.setState({new_ac_annotation_goal: new_val});
  }

  handleAnnotationMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({new_ac_annotation_method: parseInt(event.currentTarget.value, 10)});
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({error: undefined});
    let res: any = {
      name: this.state.new_ac_name.trim() || 'Unnamed Campaign',
      desc: this.state.new_ac_desc.trim(),
      datasets: [this.state.new_ac_dataset.id],
      spectro_configs: Array.from(this.state.new_ac_spectros.keys()),
      annotation_set_id: this.state.new_ac_annotation_set,
      annotation_scope: this.state.new_ac_annotation_mode,
      annotators: Array.from(this.state.new_ac_annotators.keys()),
      annotation_goal: this.state.new_ac_annotation_goal,
      annotation_method: this.state.new_ac_annotation_method,
      instructions_url: this.state.new_ac_instructions_url.trim(),
    }
    if (this.state.new_ac_confidence_indicator_set !== null) {
      res["confidence_indicator_set_id"] = this.state.new_ac_confidence_indicator_set
    }

    const start: string | undefined = this.state.new_ac_start ? this.state.new_ac_start.trim() + 'T00:00' : undefined;
    const end: string | undefined = this.state.new_ac_end ? this.state.new_ac_end.trim() + 'T00:00' : undefined;
    res = Object.assign({}, res, {start, end});
    this.postAnnotationCampaign = request.post(POST_ANNOTATION_CAMPAIGN_API_URL);
    return this.postAnnotationCampaign.set('Authorization', AuthService.shared.bearer).send(res)
    .then(() => {
      this.props.history.push('/annotation-campaigns');
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

  render() {
    const datasetOptions = Array.from(this.state.dataset_choices.values()).map(dataset => (
      <option key={`dataset-${dataset.id}`} value={dataset.id.toString()}>{dataset.name}</option>
    ));
    let wanted_annotators_label = "";
    const annotator_count = this.state.new_ac_annotators.size;
    if (this.state.new_ac_dataset.id !== undefined && this.state.new_ac_annotators.size !== 0) {
      const file_count = this.state.new_ac_dataset.files_count;
      let files_per_person = Math.floor(file_count * this.state.new_ac_annotation_goal / annotator_count);
      wanted_annotators_label = `Each annotator will annotate at least ${files_per_person} files in the campaign (${Math.round(files_per_person/file_count*100)}%), which contains ${file_count} files in total`;
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

            <ShowConfidenceIndicatorSet confidence_indicator_sets={this.state.confidence_indicator_set_choices} onChange={this.handleConfidenceSetChange} />
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
            <p className="col-sm-5">{wanted_annotators_label}</p>
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
