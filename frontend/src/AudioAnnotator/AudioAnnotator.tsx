import React, { ChangeEvent, Component } from 'react';
import { Link } from 'react-router-dom';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import request, { SuperAgentRequest } from 'superagent';
import * as utils from '../utils';

import AudioPlayer from './AudioPlayer';
import Workbench from './Workbench';

import type { ToastMsg } from '../components/Toast';
import Toast from '../components/Toast';
import { confirm } from '../components/Confirmation';

import '../css/annotator.css';

// API constants
const API_URL = '/api/annotation-task/';
const API_URL_ONE_RESULT = '/api/annotation-task/one-result/';
const API_COMMENT_URL = '/api/annotation-comment/';

// Playback rates
const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

// Annotation scopes
const SCOPE_RECTANGLE: number = 1;
const SCOPE_WHOLE: number = 2;

export type SpectroUrlsParams = {
  nfft: number,
  winsize: number,
  overlap: number,
  urls: Array<string>,
};

export type FileMetadata = {
  name: string,
  date: Date,
  audioRate: number,
};

export type AnnotationDto = {
  id: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator: string | null,
  result_comments: Array<Comment>,
};

export const TYPE_TAG: string = 'tag';
export const TYPE_BOX: string = 'box';

export type Comment = {
  id?: number,
  comment: string,
  annotation_task: number,
  annotation_result: number | null,
};

export type ConfidenceIndicator = {
  id: number,
  label: string,
  level: number,
  isDefault: boolean,
};

export type ConfidenceIndicatorSet = {
  id: number,
  name: string,
  desc: string,
  confidenceIndicators: Array<ConfidenceIndicator>,
};

export type Annotation = {
  type: string,
  id?: number,
  annotation: string,
  startTime: number,
  endTime: number,
  startFrequency: number,
  endFrequency: number,
  active: boolean,
  new: boolean,
  confidenceIndicator?: string,
  comment: string,
};

type AnnotationTask = {
  id: number,
  annotationTags: Array<string>,
  confidenceIndicatorSet: ConfidenceIndicatorSet | null,
  taskComment: Array<Comment>,
  boundaries: {
    startTime: string,
    endTime: string,
    startFrequency: number,
    endFrequency: number,
  },
  audioRate: number,
  audioUrl: string,
  spectroUrls: Array<SpectroUrlsParams>,
  prevAnnotations: Array<AnnotationDto>,
  campaignId: number,
  instructions_url?: string,
  annotationScope: number,
  prevAndNextAnnotation: {
    prev: number | string,
    next: number | string,
  },
};

type AudioAnnotatorProps = {
  match: {
    params: {
      annotation_task_id: string
    },
  },
  app_token: string,
  history: {
    push: (url: string) => void
  },
};

type AudioAnnotatorState = {
  error?: string,
  toastMsg?: ToastMsg,
  tagColors: Map<string, string>,
  isLoading: boolean,
  isPlaying: boolean,
  stopTime?: number,
  currentTime: number,
  duration: number,
  playbackRate: number,
  frequencyRange: number,
  task?: AnnotationTask,
  taskStartTime: number,
  annotations: Array<Annotation>,
  currentDefaultTagAnnotation: string,
  inAModal: boolean,
  checkbox_isChecked: {[tag: string]: boolean},
  currentComment: Comment,
  taskComment: Comment,
  currentDefaultConfidenceIndicator?: string,
};

class AudioAnnotator extends Component<AudioAnnotatorProps, AudioAnnotatorState> {
  audioContext!: AudioContext;
  audioPlayer!: AudioPlayer;
  alphanumeric_keys = [
    ["&", "é", "\"", "'", "(", "-", "è", "_", "ç"],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  ];

  getTask?: SuperAgentRequest;

  constructor(props: AudioAnnotatorProps) {
    super(props);

    const now: Date = new Date();
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.state = {
      error: undefined,
      toastMsg: undefined,
      tagColors: new Map(),
      isLoading: true,
      isPlaying: false,
      stopTime: undefined,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      frequencyRange: 0,
      task: undefined,
      taskStartTime: now.getTime(),
      annotations: [],
      currentDefaultTagAnnotation: '',
      inAModal: false,
      checkbox_isChecked: {},
      taskComment: { comment: "", annotation_task: 0, annotation_result: 0 },
      currentComment: { comment: "", annotation_task: 0, annotation_result: 0 },
    };
  }

  componentDidMount() {
    const taskId: number = parseInt(this.props.match.params.annotation_task_id, 10);
    this.retrieveTask(taskId);
    document.addEventListener("keydown", this.handleKeyPress);
  }

  componentWillUnmount() {
    if (this.getTask) {
      this.getTask.abort();
    }
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  componentDidUpdate(prevProps: AudioAnnotatorProps) {
    const prevTaskId: number = parseInt(prevProps.match.params.annotation_task_id, 10);
    const taskId: number = parseInt(this.props.match.params.annotation_task_id, 10);
    if (prevTaskId !== taskId) {
      this.retrieveTask(taskId);
    }
  }

  retrieveTask(taskId: number) {
    // Retrieve current task
    this.getTask = request.get(API_URL + taskId.toString());

    this.getTask
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .then(result => {
        const task: AnnotationTask = result.body;
        const checkbox_isChecked: {[tag: string]: boolean} = {};
        for (const k of task.annotationTags){
          checkbox_isChecked[k] = false;
        }

        if (task.annotationTags.length > 0 && task.spectroUrls.length > 0) {
          // Computing duration (in seconds)
          const startDate = new Date(task.boundaries.startTime);
          const endDate = new Date(task.boundaries.endTime)
          const duration: number = (endDate.getTime() - startDate.getTime()) / 1000;
          const frequencyRange: number = task.boundaries.endFrequency - task.boundaries.startFrequency;

          // Load previous annotations
          let annotations: Array<Annotation> = task.prevAnnotations.map((ann: AnnotationDto) => {
            const isBoxAnnotation = (typeof ann.startTime === 'number') &&
              (typeof ann.endTime === 'number') &&
              (typeof ann.startFrequency === 'number') &&
              (typeof ann.endFrequency === 'number');
            if (isBoxAnnotation) {
              return {
                type: TYPE_BOX,
                id: ann.id,
                annotation: ann.annotation,
                startTime: ann.startTime ? ann.startTime : 0,
                endTime: ann.endTime ? ann.endTime : 0,
                startFrequency: ann.startFrequency ? ann.startFrequency : 0,
                endFrequency: ann.endFrequency ? ann.endFrequency : 0,
                confidenceIndicator: ann.confidenceIndicator ? ann.confidenceIndicator : undefined,
                active: false,
                new: false,
                comment: ann.result_comments.at(0)?.comment ?? '',
              };
            } else {
              checkbox_isChecked[ann.annotation] = true;
              return {
                type: TYPE_TAG,
                id: ann.id,
                annotation: ann.annotation,
                startTime: -1,
                endTime: -1,
                startFrequency: -1,
                endFrequency: -1,
                confidenceIndicator: ann.confidenceIndicator ? ann.confidenceIndicator : undefined,
                active: false,
                new: false,
                comment: ann.result_comments.at(0)?.comment ?? '',
              };
            }
          });
          let taskComment: Comment;
          if (task.taskComment[0] === undefined) {
            taskComment = { comment: "", annotation_task: task.id, annotation_result: null }
          } else {
            taskComment = task.taskComment[0]
          }

          const firstTagAnnotation: Annotation | undefined = annotations.find((ann: Annotation) => ann.type === TYPE_TAG);

          let currentComment: Comment;
          if (firstTagAnnotation !== undefined) {
            firstTagAnnotation.active = true;
            annotations = annotations.filter((ann: Annotation) => ann.id !== firstTagAnnotation.id)
              .concat(firstTagAnnotation);
            currentComment = {
              comment: firstTagAnnotation.comment,
              annotation_task: task.id,
              annotation_result: firstTagAnnotation.id!,
            };
          } else {
            currentComment = taskComment;
          }

          let defaultConfidenceIndicator = undefined
          if (task.confidenceIndicatorSet !== null) {
            defaultConfidenceIndicator = task.confidenceIndicatorSet.confidenceIndicators.find((confidenceIndicator) =>  confidenceIndicator.isDefault === true)
          }

          // Finally, setting state
          this.setState({
            tagColors: utils.buildTagColors(task.annotationTags),
            task,
            duration,
            frequencyRange,
            isLoading: false,
            error: undefined,
            annotations,
            checkbox_isChecked:  checkbox_isChecked,
            currentDefaultConfidenceIndicator: defaultConfidenceIndicator?.label,
            currentComment,
            taskComment,
          });

        } else {
          this.setState({isLoading: false, error: 'Not enough data to retrieve spectrograms'});
        }
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  handleKeyPress = (event: any) => {
    const active_alphanumeric_keys = this.alphanumeric_keys[0].slice(0, this.state.task!.annotationTags.length);

    if(this.state.inAModal) return

    if (event.code === "Space") {
      event.preventDefault();
      this.checkAndSubmitAnnotations();
      return
    }

    if (event.key === "ArrowLeft" && this.state.task!.prevAndNextAnnotation.prev !== "") {
      this.props.history.push('/audio-annotator/' + this.state.task!.prevAndNextAnnotation.prev);
    }

    if (event.key === "ArrowRight" && this.state.task!.prevAndNextAnnotation.next !== "") {
      this.props.history.push('/audio-annotator/' + this.state.task!.prevAndNextAnnotation.next);

    }

    if(event.key === "'") {
      event.preventDefault();
    }

    active_alphanumeric_keys.forEach((value, index) => {
      const tag = this.state.task!.annotationTags[index];

      if (event.key === value || event.key === this.alphanumeric_keys[1][index]) {
        this.setState({ currentDefaultTagAnnotation: this.state.task!.annotationTags[index] });

        if (this.state.task && this.state.task.annotationScope === SCOPE_RECTANGLE) {
          this.toggleAnnotationTag(tag);
          return
        }

        if (this.state.annotations.length === 0) {
          this.toggleGlobalTag(tag);

          let newcheckbox_isChecked = this.state.checkbox_isChecked;
          newcheckbox_isChecked[tag] = true;
          this.setState({
            checkbox_isChecked: newcheckbox_isChecked
          });

        } else{
          if (this.state.checkbox_isChecked[tag]) {
            if (this.getCurrentTag() === tag) {
              /** Delete all annotations and annotations TYPE_TAG */
              this.toggleGlobalTag(tag);
            } else {
              //Change tag of this annotation
              this.toggleAnnotationTag(tag);
            }
          } else {
            /** Create a new annotation TYPE_TAG */
            this.toggleGlobalTag(tag);
          }
        }
        return
      }
    })
  }

  buildErrorMessage = (err: any) => {
    if (err !== null && typeof err === 'object' && err.status && err.message) {
      return 'Status: ' + err.status.toString() +
        ' - Reason: ' + err.message +
        (err.response.body.title ? ` - ${err.response.body.title}` : '') +
        (err.response.body.detail ? ` - ${err.response.body.detail}` : '');
    } else if (typeof err === 'string') {
      return err;
    } else {
      return err.toString();
    }
  }

  seekTo = (newTime: number) => {
    this.audioPlayer.audioElement.currentTime = newTime;
    this.updateProgress(newTime);
  }

  playPause = () => {
    if (this.audioPlayer.audioElement.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  play = (annotation?: Annotation) => {
    if (annotation) {
      this.audioPlayer.audioElement.currentTime = annotation.startTime;
      this.activateAnnotation(annotation);
    }
    this.audioPlayer.audioElement.play();

    this.setState({
      stopTime: annotation ? annotation.endTime : undefined,
    });
  }

  pause = () => {
    this.audioPlayer.audioElement.pause();

    this.setState({
      stopTime: undefined,
    });
  }

  updateProgress = (seconds: number) => {
    if (this.state.stopTime && (seconds > this.state.stopTime)) {
      this.pause();
    } else {
      this.setState({currentTime: seconds});
    }
  }

  getCurrentTag = () => {
    const activeTag = this.state.annotations.find((ann: Annotation) => ann.active && ann.annotation);
    if (activeTag) {
      return activeTag.annotation;
    }
    return "";
  };

  saveAnnotation = (annotation: Annotation) => {
    const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;

    const maxId: number | undefined = this.state.annotations
      .map(ann => ann.id ?? 0)
      .sort((a, b) => b - a)
      .shift();

    const newId: string = maxId ? `${(maxId + 1).toString()}` : `1`;

    if (isPresenceMode) {
      if (annotation.type === TYPE_BOX) {
        const newAnnotation: Annotation = Object.assign(
          {}, annotation, {
            id: parseInt(newId, 10),
            annotation: this.getCurrentTag(),
          }
        );
        this.activateAnnotation(newAnnotation);
      } else {
        // Type: TYPE_TAG
        const newAnnotation: Annotation = Object.assign(
          {},
          annotation,
          { id: parseInt(newId, 10) }
        );
        let newcheckbox_isChecked = this.state.checkbox_isChecked;
        newcheckbox_isChecked[annotation.annotation] = true;
        this.setState({
          checkbox_isChecked: newcheckbox_isChecked
        });

        this.activateAnnotation(newAnnotation);
      }
    } else {
      const newAnnotation: Annotation = Object.assign(
        {}, annotation, { id: parseInt(newId, 10) }
      );

      if (this.state.annotations.length === 0) {
        this.setState({
          toastMsg: {msg: 'Select a tag to annotate the box.', lvl: 'primary'},
        });
      }
      this.activateAnnotation(newAnnotation);
    }
  }

  updateAnnotation = (annotation: Annotation) => {
    const annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== annotation.id)
      .concat(annotation);

    this.setState({annotations});
  }

  deleteAnnotation = (annotation: Annotation) => {
    const annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== annotation.id);

    this.setState({annotations});
  }

  activateAnnotation = (annotation: Annotation) => {
    const activated: Annotation = Object.assign(
      {}, annotation, { active: true }
    );

    const annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== activated.id)
      .map(ann => Object.assign({}, ann, { active: false }))
      .concat(activated);

    const currentComment = this.getCurrentComment(annotations)

    this.setState({
      annotations: annotations,
      currentDefaultTagAnnotation:  activated.annotation,
      currentDefaultConfidenceIndicator: activated.confidenceIndicator,
      currentComment: currentComment
    });
  }

  toggleAnnotationTag = (tag: string) => {
    const activeAnn: Annotation | undefined = this.state.annotations
      .find(ann => ann.type === TYPE_BOX && ann.active);

    if (activeAnn) {
      const newTag: string = (activeAnn.annotation === tag) ? '' : tag;
      const newAnnotation: Annotation = Object.assign(
        {}, activeAnn, { annotation: newTag, }
      );
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => !ann.active)
        .concat(newAnnotation);

      const newComment = this.getCurrentComment(annotations)
      this.setState({
        annotations,
        toastMsg: undefined,
        currentDefaultTagAnnotation: tag,
        currentComment: newComment
      });
    }
  }

  toggleAnnotationConfidence = (confidenceIndicator: string) => {
    const activeAnn: Annotation | undefined = this.state.annotations
      .find(ann => ann.active);

    if (activeAnn) {
      const newConfidence: string = (activeAnn.confidenceIndicator === confidenceIndicator) ? '' : confidenceIndicator;
      const newAnnotation: Annotation = Object.assign(
        {}, activeAnn, { confidenceIndicator: newConfidence,  }
      );
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => !ann.active)
        .concat(newAnnotation);

      this.setState({
        annotations,
        toastMsg: undefined,
        currentDefaultConfidenceIndicator: confidenceIndicator,
      });
    }
  }

  toggleGlobalTag = (tag: string) => {
    if (this.state.checkbox_isChecked[tag]) {
      this.deleteAnnotationInPresenceMode(tag)
    } else {
      // Tag is not present: create it
      const newAnnotation: Annotation = {
        type: TYPE_TAG,
        id: undefined,
        annotation: tag,
        startTime: -1,
        endTime: -1,
        startFrequency: -1,
        endFrequency: -1,
        confidenceIndicator: this.state.currentDefaultConfidenceIndicator,
        active: true,
        new: true,
        comment: '',
      };
      this.saveAnnotation(newAnnotation);
    }
  }

  async deleteAnnotationInPresenceMode(tag: string) {
    this.setState({ inAModal: true });

    if (await confirm("Are your sure?")) {
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => ann.annotation !== tag);

      if (annotations.length > 0) {
        const annotationToActive = annotations.find((ann: Annotation) => ann.type === TYPE_TAG);
        if (annotationToActive) {
          annotationToActive.active = true;
        }
      }
      let newcheckbox_isChecked = this.state.checkbox_isChecked;
      newcheckbox_isChecked[tag] = false;

      this.setState({
        annotations,
        toastMsg: undefined,
        checkbox_isChecked: newcheckbox_isChecked,
      });
    }
    this.setState({ inAModal: false });

}

  checkAndSubmitAnnotations = () => {
    const emptyAnnotations = this.state.annotations
      .filter((ann: Annotation) => ann.annotation.length === 0);

    let emptyConfidenceIndicator = [];
    if (this.state.task!.confidenceIndicatorSet !== null) {
      emptyConfidenceIndicator = this.state.annotations
        .filter((ann: Annotation) => ann.confidenceIndicator === undefined || ann.confidenceIndicator?.length === 0);
    }

    if (emptyAnnotations.length > 0) {
      this.activateAnnotation(emptyAnnotations.shift()!);
      this.setState({
        toastMsg: {msg: 'Make sure all your annotations are tagged.', lvl: 'danger'},
      });
    } else if (emptyConfidenceIndicator.length > 0) {
      this.setState({
        toastMsg: {msg: 'Make sure all your annotations have a confidence indicator.', lvl: 'danger'},
      });
    } else {
      this.submitAnnotations();
    }
  }

  cleanAnnotation(ann: Annotation): AnnotationDto {
    const startTime = ann.type === TYPE_BOX ? ann.startTime : null;
    const endTime = ann.type === TYPE_BOX ? ann.endTime : null;
    const startFrequency = ann.type === TYPE_BOX ? ann.startFrequency : null;
    const endFrequency = ann.type === TYPE_BOX ? ann.endFrequency : null;
    const result_comments: Comment[] = ann.comment === "" ? [] : [{
      comment: ann.comment,
      annotation_result: ann.id!,
      annotation_task: this.state.task!.id,
    }];
      return {
        id: ann.id!,
        startTime,
        endTime,
        annotation: ann.annotation,
        startFrequency,
        endFrequency,
        confidenceIndicator: ann.confidenceIndicator ?? null,
        result_comments,
      };
  }

  submitAnnotations = () => {
    const taskId: number = this.state.task!.id;

    const cleanAnnotations: Array<AnnotationDto> = this.state.annotations
      .sort((a, b) => a.startTime - b.startTime)
      .map((ann) => this.cleanAnnotation(ann));
    const now: Date = new Date();
    const taskStartTime: number = Math.floor(this.state.taskStartTime / 1000);
    const taskEndTime: number = Math.floor(now.getTime() / 1000);

    request.put(API_URL + taskId.toString() + '/')
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .send({
        annotations: cleanAnnotations,
        task_start_time: taskStartTime,
        task_end_time: taskEndTime,
      })
      .then(result => {
        const nextTask: number = result.body.next_task;
        const campaignId: number = result.body.campaign_id;

        if (nextTask) {
          this.props.history.push('/audio-annotator/' + nextTask.toString());
        } else {
          this.props.history.push('/annotation_tasks/' + campaignId.toString());
        }
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  changePlaybackRate = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      playbackRate: parseFloat(event.target.value),
    });
  }

  render() {
    if (this.state.isLoading) {
      return <p>Loading...</p>;
    } else if (this.state.error) {
      return <p>Error while loading task: <code>{this.state.error}</code></p>
    } else if (!this.state.task) {
      return <p>Unknown error while loading task.</p>
    } else {
      const task: AnnotationTask = this.state.task;
      const playStatusClass = this.state.isPlaying ? "fa-pause-circle" : "fa-play-circle";

      const playbackRateOptions = AVAILABLE_RATES.map(rate => (
        <option key={`rate-${rate}`} value={rate.toString()}>{rate.toString()}x</option>
      ));
      let playbackRateSelect;
      if (this.audioPlayer) {
        const el = this.audioPlayer.audioElement;
        if (el.preservesPitch !== undefined) {
          playbackRateSelect = (
              <select className="form-control select-rate"
                      defaultValue={this.state.playbackRate}
                      onChange={this.changePlaybackRate}>
                { playbackRateOptions }
              </select>
          );
        }
      }

      // File data
      const fileMetadata: FileMetadata = {
        name: task.audioUrl.split('/').pop() ?? '',
        date: new Date(task.boundaries.startTime),
        audioRate: task.audioRate,
      };

      // Displayable annotations (for presence mode)
      const boxAnnotations = this.state.annotations.filter((ann: Annotation) => ann.type === TYPE_BOX);

      // Is drawing enabled? (always in box mode, when a tag is selected in presence mode)
      const isDrawingEnabled = !!task && (task.annotationScope === SCOPE_RECTANGLE || (
        task.annotationScope === SCOPE_WHOLE && this.getCurrentTag() !== ''
      ));

      // Rendering
      return (
        <div className="annotator container-fluid ps-0">

          {/* Header */}
          <div className="row">
            <h1 className="col-sm-6">APLOSE</h1>
            <p className="col-sm-4 annotator-nav">
              {this.renderUserGuideLink()}
              {this.renderInstructionsLink()}
            </p>
            <ul className="col-sm-2 annotator-nav">
              <li><Link
                className="btn btn-danger"
                to={`/annotation_tasks/${task.campaignId}`}
                title="Go back to annotation campaign tasks"
              >
                Back to campaign
              </Link></li>
            </ul>
          </div>

          {/* Audio player (hidden) */}
          <AudioPlayer
            // controls
            listenInterval={10}
            onListen={(seconds: number) => this.updateProgress(seconds)}
            onLoadedMetadata={() => this.updateProgress(0)}
            preload="auto"
            ref={(element) => { if (element) this.audioPlayer = element; } }
            playbackRate={this.state.playbackRate}
            src={task.audioUrl}
            onPause={() => this.setState({isPlaying: false})}
            onAbort={() => this.setState({isPlaying: false})}
            onPlay={() => this.setState({isPlaying: true})}
          ></AudioPlayer>

          {/* Workbench (spectrogram viz, box drawing) */}
          <Workbench
            tagColors={this.state.tagColors}
            currentTime={this.state.currentTime}
            duration={this.state.duration}
            fileMetadata={fileMetadata}
            startFrequency={task.boundaries.startFrequency}
            frequencyRange={this.state.frequencyRange}
            spectroUrlsParams={task.spectroUrls}
            annotations={boxAnnotations}
            onAnnotationCreated={this.saveAnnotation}
            onAnnotationUpdated={this.updateAnnotation}
            onAnnotationDeleted={this.deleteAnnotation}
            onAnnotationSelected={this.activateAnnotation}
            onAnnotationPlayed={this.play}
            onSeek={this.seekTo}
            drawingEnabled={isDrawingEnabled}
            currentDefaultTagAnnotation={this.state.currentDefaultTagAnnotation}
            currentDefaultConfidenceIndicator={this.state.currentDefaultConfidenceIndicator}
          >
          </Workbench>

          {/* Toolbar (play button, play speed, submit button, timer) */}
          <div className="row annotator-controls">
            <p className="col-sm-1 text-right">
              <button
                className={`btn-simple btn-play fas ${playStatusClass}`}
                onClick={this.playPause}
              ></button>
            </p>
            <p className="col-sm-1">
              {playbackRateSelect}
            </p>

            <div className="col-sm-5 text-center">
            <OverlayTrigger overlay={
              <div className="card">
                <h3 className={`card-header tooltip-header`}>Shortcut</h3>
                <div className="card-body p-1">
                  <p>
                    <span className="font-italic"><i className="fa fa-arrow-left"></i></span>{" : load previously recording"}<br/>
                  </p>
                </div>
              </div>
              }>
              <Link className={`btn btn-submit rounded-left rounded-right-0 ${this.state.task.prevAndNextAnnotation.prev === "" ? 'disabled' : ''}`}
                to={this.state.task.prevAndNextAnnotation.prev === "" ? "#" : `/audio-annotator/${ this.state.task.prevAndNextAnnotation.prev}`}>
                <i className="fa fa-caret-left"></i>
              </Link>
            </OverlayTrigger>
              <OverlayTrigger overlay={
              <div className="card">
                <h3 className={`card-header tooltip-header`}>Shortcut</h3>
                <div className="card-body p-1">
                  <p>
                    <span className="font-italic">Enter</span>{" : Submit & load next recording"}<br/>
                  </p>
                </div>
              </div>
              }>
              <button
                className="btn btn-submit border-radius-0"
                onClick={this.checkAndSubmitAnnotations}
                type="button"
              >Submit &amp; load next recording</button>
            </OverlayTrigger>
            <OverlayTrigger overlay={
              <div className="card">
                <h3 className={`card-header tooltip-header`}>Shortcut</h3>
                <div className="card-body p-1">
                  <p>
                    <span className="font-italic"><i className="fa fa-arrow-right"></i></span>{" : load next recording"}<br/>
                  </p>
                </div>
              </div>
              }>
              <Link className={`btn btn-submit rounded-right rounded-left-0 ${this.state.task.prevAndNextAnnotation.next === "" ? 'disabled' : ''}`}
                to={this.state.task.prevAndNextAnnotation.next === "" ? "#" : `/audio-annotator/${this.state.task.prevAndNextAnnotation.next}`}>
                <i className="fa fa-caret-right"></i>
              </Link>
            </OverlayTrigger>
            </div>


            <div className="col-sm-3">
              <Toast toastMsg={this.state.toastMsg}></Toast>
            </div>
            <p className="col-sm-2 text-right">
              {utils.formatTimestamp(this.state.currentTime)}
              &nbsp;/&nbsp;
              {utils.formatTimestamp(this.state.duration)}
            </p>
          </div>

          {/* Tag and annotations management */}
          {this.renderAnnotationArea()}

        </div>
      );
    }
  }

  annotationSorter = (a: Annotation, b: Annotation): number => {
    if (this.state.task && this.state.task.annotationScope === SCOPE_WHOLE) {
      if (a.annotation !== b.annotation) {
        return a.annotation.localeCompare(b.annotation);
      }
    }
    return a.startTime - b.startTime;
  }

  beforeSubmit_checkPresenceMode = (ann: Annotation) => {
    if (ann.annotation.length === 0) {
      this.setState({
        toastMsg: {msg: 'Make sure your annotations is tagged.', lvl: 'danger'},
      });
      return
    }

    if (this.state.task!.confidenceIndicatorSet !== null && (ann.confidenceIndicator === undefined || ann.confidenceIndicator.length === 0)) {
      this.setState({
        toastMsg: {msg: 'Make sure your annotations have a confidence indicator.', lvl: 'danger'},
      });
      return
    }

    const taskId: number = this.state.task!.id;
    const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;

    // Save new AnnotationTag in PresenceMode
    if (isPresenceMode) {
      let annotationTag: Array<Annotation> = this.state.annotations
        .filter(annotation =>
            annotation.type === "tag"
          && annotation.annotation === ann.annotation
          && annotation.new
      )

      if (annotationTag.length === 1) {
        // this task need the creation of a new annotation[type: tag] before save the annotation and comment
        const cleanAnnotationTag = this.cleanAnnotation(annotationTag[0])
        const now: Date = new Date();
        const taskStartTime: number = Math.floor(this.state.taskStartTime / 1000);
        const taskEndTime: number = Math.floor(now.getTime() / 1000);

        request.put(API_URL_ONE_RESULT + taskId.toString() + '/')
          .set('Authorization', 'Bearer ' + this.props.app_token)
          .send({
            annotations: cleanAnnotationTag,
            task_start_time: taskStartTime,
            task_end_time: taskEndTime,
          })
          .then(data => {
            let newAnnotationTag = data.body
            this.updateAnnotationsWithNewId(cleanAnnotationTag.id, newAnnotationTag.id)
            this.submitOneAnnotationAndAComment(ann)
          }
          )
        .catch(err => {
          if (err.status && err.status === 401) {
            // Server returned 401 which means token was revoked
            document.cookie = 'token=;max-age=0;path=/';
            window.location.reload();
          } else {
            this.setState({isLoading: false, error: this.buildErrorMessage(err)});
          }
        });
      } else {
        this.submitOneAnnotationAndAComment(ann)
      }
    } else {
      this.submitOneAnnotationAndAComment(ann)
    }
  }

  updateAnnotationsWithNewId = (oldId: number, newId: number) => {
    if (oldId !== newId) {
      const anotherAnnotationsWithSameId: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id === newId)
      .map(ann => Object.assign({}, ann, { id: newId + 1000 }))

    let annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== newId)
      .concat(anotherAnnotationsWithSameId)

    const annotationsWithNewId: Array<Annotation> = annotations
      .filter(ann => ann.id === oldId)
      .map(ann => Object.assign({}, ann, { id: newId }))

    annotations = annotations
      .filter(ann => ann.id !==  oldId)
      .concat(annotationsWithNewId)

      this.setState({
        annotations: annotations,
      })

    return annotationsWithNewId
    }
  }

  submitOneAnnotationAndAComment(ann: Annotation) {
    const cleanAnnotation = this.cleanAnnotation(ann)
    const now: Date = new Date();
    const taskStartTime: number = Math.floor(this.state.taskStartTime / 1000);
    const taskEndTime: number = Math.floor(now.getTime() / 1000);

    request.put(API_URL_ONE_RESULT + this.state.task!.id.toString() + '/')
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .send({
        annotations: cleanAnnotation,
        task_start_time: taskStartTime,
        task_end_time: taskEndTime,
      })
      .then(result => {
        const annotation_result = result.body
        this.setState({ toastMsg: { msg: "This Annotation is saved", lvl: "success" } });
        this.submitComment(annotation_result.id)
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  submitComment = (annotation_result_id= this.state.currentComment.annotation_result!) => {
    let method = "post"
    let url = API_COMMENT_URL
    if (this.state.currentComment.id) {
      method = "put"
      url += this.state.currentComment.id + "/"
    } else {
      if (this.state.currentComment.comment === "") {
        /** Don't save new empty comment */
        return
      }
    }

    request(method, url)
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .send({
        comment: this.state.currentComment.comment,
        annotation_task_id: this.state.currentComment.annotation_task,
        annotation_result_id: annotation_result_id,
        comment_id: this.state.currentComment.id,
      })
      .then((result: any) => {
        let comment = result.body

        if (comment.delete) {
          comment = {
            comment: "",
            annotation_task: this.state.currentComment.annotation_task,
            annotation_result: annotation_result_id,
            comment_id: null,
          }
        }

        if (comment.annotation_result === null)
        {
          this.setState({
            currentComment: comment,
            taskComment: comment,
          })
        } else {
          let annotations
          if (comment.annotation_result !== annotation_result_id) {

            const anotherAnnotationsWithSameId: Array<Annotation> = this.state.annotations
              .filter(ann => ann.id === annotation_result_id)
              .map(ann => Object.assign({}, ann, { id: annotation_result_id + 200 }));

            annotations = this.state.annotations
              .filter(ann => ann.id !== annotation_result_id + 200)
              .concat(anotherAnnotationsWithSameId);
          } else {
              annotations = this.state.annotations
          }

          const annotationsWithNewComment: Array<Annotation> = annotations
            .filter(ann => ann.id === this.state.currentComment.annotation_result)
            .map(ann => Object.assign({}, ann, { comment: comment.comment, id: annotation_result_id }))

          annotations = annotations
          .filter(ann => ann.id !== this.state.currentComment.annotation_result)
            .concat(annotationsWithNewComment)

          this.setState({
            annotations: annotations,
            currentComment: comment,
          })
        }
      })
      .catch((err: any) => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({ toastMsg: { msg: this.buildErrorMessage(err), lvl: "danger"} });
        }
      });
  }

  submitCommentAndAnnotation = () => {
    const commentAnnotation: Annotation | undefined = this.state.annotations.find((ann) => ann.id === this.state.currentComment.annotation_result);
    if (commentAnnotation && commentAnnotation.new) {
      this.beforeSubmit_checkPresenceMode(commentAnnotation);
    } else {
      this.submitComment();
    }
  }

  getCurrentComment(annotations: Array<Annotation>): Comment {
    const activeAnn: Annotation | undefined = annotations.find(ann => ann.active);
    let currentComment: Comment;

    if (activeAnn === undefined) {
      currentComment = this.state.taskComment;
    } else {
      currentComment = { comment: activeAnn.comment, annotation_task: this.state.task!.id, annotation_result: activeAnn.id ?? 0 };
    }
    return currentComment
  }

  switchToTaskComment = () => {
    const annotations: Array<Annotation> = this.state.annotations
      .map(ann => Object.assign({}, ann, { active: false }))
    this.setState({ currentComment: this.state.taskComment, annotations: annotations })
  }

  handleCommentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ currentComment: Object.assign({}, this.state.currentComment, {comment: event.target.value})});
  }

  renderAnnotationArea = () => {
    const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;
    const sortedAnnotations: Array<Annotation> = this.state.annotations.sort(this.annotationSorter);

    return (
      <React.Fragment>
        <div className="row justify-content-around m-2">
          {this.renderActiveBoxAnnotation()}
          {isPresenceMode ? this.presenceAbsentTagCheckbox() : null}
        </div>
        <div className="row justify-content-center">
            <div className='mt-2 table__rounded shadow-double border__black--125'>
              <table className="table table-hover rounded">
                <thead className="">
                  <tr className="text-center bg__black--003">
                    <th colSpan={5}>Annotations</th>
                  </tr>
                </thead>
                  <tbody>
                  {sortedAnnotations.map((annotation: Annotation, idx: number) => this.renderAnnotationListItem(annotation, idx))}
                </tbody>
              </table>
          </div>
          <div className="col-sm-2">
              <div className="card">
                <h6 className="card-header text-center">Comments</h6>
              <div className="card-body">
                <div className="row m-2">
                  <textarea key="textAreaComments" id="commentInput" className="col-sm-10 comments"
                    maxLength={255}
                    rows={10}
                    cols={10}
                    value={this.state.currentComment.comment}
                    onChange={this.handleCommentChange}
                    onFocus={() => { this.setState({ inAModal: true }) }}
                    onBlur={() => { this.setState({ inAModal: false }) }}
                  ></textarea>
                  <div className="input-group-append col-sm-2 p-0">
                      <div className="btn-group-vertical">
                      <button className="btn btn-submit" onClick={()=>{this.submitCommentAndAnnotation()}}>
                          <i className="fas fa-check"></i>
                      </button>
                      <button className="btn btn-danger ml-0" onClick={()=>{this.setState({currentComment:  Object.assign({}, this.state.currentComment, {comment: ""})})}}>
                        <i className="fas fa-broom"></i>
                      </button>
                      </div>
                  </div>
                </div>
              </div>
              <button className={`btn w-100 ${this.state.currentComment.annotation_result === null ? "isActive" : ""}`}
                      onClick={() => { this.switchToTaskComment() }}
              >
                  Task Comment {this.state.taskComment.comment !== "" ? <i className="fas fa-comment mx-2"></i> : <i className="far fa-comment mr-2"></i>}
                </button>
              </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderTags = () => {
    if (this.state.task) {

      const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;
      const activeTags = this.state.currentDefaultTagAnnotation;
      const tags = this.state.task.annotationTags.map((tag, idx) => {
        const color: string = utils.getTagColor(this.state.tagColors, tag);

        const tooltip = this.state.checkbox_isChecked[tag] ? (
          <div className="card" key={`tooltip_${tag[0]}`}>
            <h3 className={`card-header p-2 tooltip-header tooltip-header__${idx.toString()}`}>Shortcut</h3>
            <div className="card-body p-1">
                <p>
                  <span className="font-italic">{this.alphanumeric_keys[1][idx]}</span>
                  {" or "}
                  <span className="font-italic">{this.alphanumeric_keys[0][idx]}</span>
                  {" : choose this tag"}<br/>
                  <span className="font-italic">{`${this.alphanumeric_keys[1][idx]} + ${this.alphanumeric_keys[1][idx]}`}</span>
                  {" or "}
                  <span className="font-italic">{`${this.alphanumeric_keys[0][idx]} + ${this.alphanumeric_keys[0][idx]}`}</span>
                  {" : delete all annotations of this tag"}
                </p>
            </div>
          </div>) : (<div key={`tooltip_${tag[0]}`}></div>)

      const style = {
        inactive: {
          backgroundColor: color,
          border: 'none',
          color: '#ffffff',
        },
        active: {
          backgroundColor: 'transparent',
          border: `1px solid ${color}`,
          color: color,
        },
      };

        return (
          <OverlayTrigger overlay={tooltip} key={`tag-overlay-${idx.toString()}`} placement="top">
            <li key={`tag-${idx.toString()}`}>
              <button
                id={`tags_key_shortcuts_${idx.toString()}`}
                className={this.state.checkbox_isChecked[tag]  ? `btn pulse__${idx.toString()}--active` : 'btn'}
                style={(activeTags.includes(tag)) ? style.active : style.inactive}
                onClick={() => this.toggleAnnotationTag(tag)}
                type="button"
                disabled={isPresenceMode ? !this.state.checkbox_isChecked[tag] : false }
              >{tag}</button>
            </li>
          </OverlayTrigger>
      );
      });

      return (
        <ul className="card-text annotation-tags">{tags}</ul>
      );

    } else {
      return (
        <React.Fragment></React.Fragment>
      );
    }
  }
  presenceAbsentTagCheckbox = () => {
    if (this.state.task) {
      // <li> tag checkbox generator
        const tags = this.state.task.annotationTags.map((tag, idx) => {
          const color: string = utils.getTagColor(this.state.tagColors, tag);
          const tooltip = (
            <div className="card">
              <h3 className={`card-header p-2 tooltip-header tooltip-header__${idx.toString()}`}>Shortcut</h3>
              <div className="card-body p-1">
                  <p>
                    <span className="font-italic">{this.alphanumeric_keys[1][idx]}</span>
                    {" or "}
                    <span className="font-italic">{this.alphanumeric_keys[0][idx]}</span>
                    {" : choose this tag"}<br/>
                    <span className="font-italic">{`${this.alphanumeric_keys[1][idx]} + ${this.alphanumeric_keys[1][idx]}`}</span>
                    {" or "}
                    <span className="font-italic">{`${this.alphanumeric_keys[0][idx]} + ${this.alphanumeric_keys[0][idx]}`}</span>
                    {" : delete all annotations of this tag"}
                  </p>
              </div>
            </div>
          )
          return (
          <li className="form-check tooltip-wrap" key={`tag-${idx.toString()}`}>
              <input
                id={`tags_key_checkbox_shortcuts_${idx.toString()}`}
                className="form-check-input"
                type="checkbox"
                onChange={() => this.toggleGlobalTag(tag)}
                checked={this.state.checkbox_isChecked[tag]}
              />

              <OverlayTrigger overlay={tooltip} placement="top">
                <label className="form-check-label" htmlFor={`tags_key_checkbox_shortcuts_${idx.toString()}`} style={{ color }}>
                  {tag}
                </label>
              </OverlayTrigger>
          </li>
        )
      });

      return (
          <div className="card ml-2 flex-grow-1 mini-content">
            <h6 className="card-header text-center">Presence / Absence</h6>
          <div className="card-body">
            <ul className="presence-absence-columns">
                {tags}
            </ul>
            </div>
          </div>
        );
      } else {
        return (
          <div className="card">
            <h6 className="card-header text-center">Presence / Absence</h6>
            <div className="card-body">
              <p className="card-text text-center">-</p>
            </div>
          </div>
      );
    }
  }

  renderConfidenceIndicator = () => {
    if (this.state.task && this.state.task.confidenceIndicatorSet !== null && this.state.currentDefaultConfidenceIndicator !== undefined) {

      const activeConfidenceIndicator = this.state.currentDefaultConfidenceIndicator;
      const tooltip = (
        <div className="card w-50">
          <h3 className={`card-header p-2 tooltip-header`}>Description</h3>
          <div className="card-body p-1">
            <p>
            {this.state.task.confidenceIndicatorSet.desc}
              </p>
          </div>
        </div>
      )

      const confidenceIndicators = this.state.task.confidenceIndicatorSet.confidenceIndicators.map((confidenceIndicator, idx) => {

        return (
          <li key={`tag-${idx.toString()}`}>
            <button
              id={`tags_key_shortcuts_${idx.toString()}`}
              className={activeConfidenceIndicator === confidenceIndicator.label ? "btn btn--active" : "btn"}
              onClick={() => this.toggleAnnotationConfidence(confidenceIndicator.label)}
              type="button"
            >{confidenceIndicator.label}</button>
          </li>
        );
        });

      return (
        <OverlayTrigger overlay={tooltip} placement="top">
          <div className="card">
              <h6 className="card-header text-center">Confidence indicator</h6>
              <div className="card-body">
                <div className=" d-flex justify-content-center">
                  <ul className="card-text annotation-tags">{confidenceIndicators}</ul>
                </div>
            </div>
          </div>
        </OverlayTrigger>
        );
}
    else {
      return (<React.Fragment></React.Fragment>);
    }
  }

  renderActiveBoxAnnotation = () => {
    const activeAnn: Annotation | undefined = this.state.annotations.find(ann => ann.active);
    const tags = this.renderTags();

    if (activeAnn && this.state.task) {
      const ann: Annotation = activeAnn;
      let max_time = "00:00.000";
      if (ann.endTime === -1) {
        const timeInSeconds = (Date.parse(this.state.task.boundaries.endTime) - Date.parse(this.state.task.boundaries.startTime) ) / 1000
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds - minutes * 60;
        max_time = `${minutes.toFixed().padStart(2, "0")}:${seconds.toFixed().padStart(2, "0")}:000`;
      }

      return (
        <React.Fragment>
        <div className="card mr-2 selected_annotation mini-content">
          <h6 className="card-header text-center">Selected annotation</h6>
          <div className="card-body d-flex justify-content-between">
              <p className="card-text">
              <i className="fa fa-clock"></i> :&nbsp;
                {ann.startTime === -1 ? "00:00.000" : utils.formatTimestamp(ann.startTime)}&nbsp;&gt;&nbsp;
                {ann.endTime === -1 ? max_time: utils.formatTimestamp(ann.endTime)}<br />
              <i className="fa fa-arrow-up"></i> :&nbsp;
                {ann.startFrequency === -1 ? this.state.task.boundaries.startFrequency : ann.startFrequency.toFixed(2)}&nbsp;&gt;&nbsp;
                {ann.endFrequency === -1 ? this.state.task.boundaries.endFrequency : ann.endFrequency.toFixed(2)} Hz<br />
                <i className="fa fa-tag"></i> :&nbsp;{ann.annotation ? ann.annotation : "None"}<br />
                {this.state.task.confidenceIndicatorSet !== null &&
                  <span><i className="fa fa-handshake"></i> :&nbsp; {ann.confidenceIndicator ? ann.confidenceIndicator : "None"} <br /></span>
                }
            </p>
          </div>
        </div>
        <div className="col-5 flex-shrink-2">
          <div className="card">
            <h6 className="card-header text-center">Tags list</h6>
            <div className="card-body d-flex justify-content-between">
                {tags}
            </div>
          </div>

          {/* Confidence Indicator management */}
            {this.renderConfidenceIndicator()}
        </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div className="card mr-2  selected_annotation mini-content">
            <h6 className="card-header text-center">Selected annotation</h6>
            <div className="card-body">
              <p className="card-text text-center">-</p>
            </div>
          </div>

          <div className="col-5 flex-shrink-2">
              <div className="card">
                <h6 className="card-header text-center">Tags list</h6>
                <div className="card-body d-flex justify-content-between">
                    {tags}
                </div>
              </div>

            {/* Confidence Indicator management */}
            {this.renderConfidenceIndicator()}


          </div>
        </React.Fragment>
      );
    }
  }

  renderAnnotationListItem = (annotation: Annotation, idx: number) => {
    if (annotation.type === TYPE_BOX) {
      return (
        <tr
          key={`listann-${idx.toFixed()}`}
          className={annotation.active ? "isActive p-1" : "p-1"}
          onClick={() => this.activateAnnotation(annotation)}
        >
          <td className="p-1">
            <i className="fas fa-clock-o"></i>&nbsp;
            {utils.formatTimestamp(annotation.startTime)}&nbsp;&gt;&nbsp;
            {utils.formatTimestamp(annotation.endTime)}
          </td>
          <td className="p-1">
            <i className="fas fa-arrow-up"></i>&nbsp;
            {annotation.startFrequency.toFixed(2)}&nbsp;&gt;&nbsp;
            {annotation.endFrequency.toFixed(2)} Hz
          </td>
          <td className="p-1">
            <i className="fas fa-tag"></i>&nbsp;
            {(annotation.annotation !== '') ? annotation.annotation : '-'}
          </td>
          <td className="p-1">
            <i className="fa fa-handshake"></i>&nbsp;
            {(annotation.confidenceIndicator !== '') ? annotation.confidenceIndicator : '-'}
          </td>
          <td className="p-1">
          {annotation.comment !== '' ? <i className="fas fa-comment mr-2"></i> : <i className="far fa-comment mr-2"></i>}
          </td>
        </tr>
      );
    } else if (annotation.type === TYPE_TAG) {
      return (
        <tr
          key={`listen-${annotation.id}`}
          className={annotation.active ? "isActive" : ""}
          onClick={() => this.activateAnnotation(annotation)}
        >
          <td colSpan={3}>
            <strong>
              <i className="fas fa-tag"></i>&nbsp;
              {annotation.annotation}
            </strong>
          </td>
          <td>
            <i className="fa fa-handshake"></i>&nbsp;
            {(annotation.confidenceIndicator !== '') ? annotation.confidenceIndicator : '-'}
          </td>
          <td className="pl-1">
          {annotation.comment !== '' ? <i className="fas fa-comment mr-2"></i> : <i className="far fa-comment mr-2"></i>}
          </td>
        </tr>
      );
    }
  }

  renderUserGuideLink = () => {
    return (
      <span>
        <a
          href="https://github.com/Project-OSmOSE/osmose-app/blob/master/docs/user_guide_annotator.md"
          rel="noopener noreferrer"
          target="_blank"
        ><span className="fas fa-question-circle"></span>&nbsp;Annotator User Guide</a>
      </span>
    );
  }

  renderInstructionsLink = () => {
    if (this.state.task && this.state.task.instructions_url) {
      return (
        <span>
          <a
            href={this.state.task.instructions_url}
            rel="noopener noreferrer"
            target="_blank"
          ><span className="fas fa-info-circle"></span>&nbsp;Campaign instructions</a>
        </span>
      );
    }
  }
}

export default AudioAnnotator;
