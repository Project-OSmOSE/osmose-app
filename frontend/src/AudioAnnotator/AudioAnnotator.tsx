import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import * as utils from '../utils';

import AudioPlayer from './AudioPlayer';
import Workbench from './Workbench';

import type { ToastMsg } from '../components/Toast';
import Toast from '../components/Toast';
import { confirm } from '../components/Confirmation';

import '../css/annotator.css';
import { CommentBloc } from "./bloc/CommentBloc.tsx";
import { AnnotationList } from "./bloc/AnnotationList.tsx";
import { AnnotationMode } from "../services/API/ApiService.data.tsx";
import { PresenceBloc } from "./bloc/PresenceBloc.tsx";
import { ConfidenceIndicatorBloc } from "./bloc/ConfidenceIndicatorBloc.tsx";
import { TagListBloc } from "./bloc/TagListBloc.tsx";
import { CurrentAnnotationBloc } from "./bloc/CurrentAnnotationBloc.tsx";
import { alphanumeric_keys, buildTagColors } from "../utils";
import { AnnotationCommentsApiService } from "../services/API/AnnotationCommentsApiService.tsx";
import { AnnotationTasksApiService } from "../services/API/AnnotationTasksApiService.tsx";


// Playback rates
const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

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
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<Comment>,
};

export const TYPE_TAG: string = 'tag';
export const TYPE_BOX: string = 'box';

export type Comment = {
  id?: number,
  comment: string,
  annotation_task: number,
  annotation_result: number | null,
  newAnnotation?: boolean
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
  confidenceIndicator?: string,
  result_comments: Array<Comment>,
};

type AnnotationTask = {
  id: number,
  annotationTags: Array<string>,
  confidenceIndicatorSet?: ConfidenceIndicatorSet,
  taskComment: Array<Comment>,
  boundaries: TaskBoundaries,
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

export interface TaskBoundaries {
  startTime: Date,
  endTime: Date,
  startFrequency: number,
  endFrequency: number,
}

type AudioAnnotatorProps = {
  match: {
    params: {
      annotation_task_id: string
    },
  },
};


const AudioAnnotator: React.FC<AudioAnnotatorProps> = ({ match }) => {
  const history = useHistory();

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [stopTime, setStopTime] = useState<number | undefined>();

  const [annotations, setAnnotations] = useState<Array<Annotation>>([]);
  const [task, setTask] = useState<AnnotationTask |undefined>();
  const [currentComment, setCurrentComment] = useState<Comment>({
    comment: '',
    annotation_task: 0,
    annotation_result: 0
  });
  const [taskComment, setTaskComment] = useState<Comment>({
    comment: '',
    annotation_task: 0,
    annotation_result: null
  });

  const [frequencyRange, setFrequencyRange] = useState<number>(0);
  const [selectedPresences, setSelectedPresences] = useState<Set<string>>(new Set());
  const [tagColors, setTagColors] = useState<Map<string, string>>(new Map());
  const [currentDefaultConfidenceIndicator, setCurrentDefaultConfidenceIndicator] = useState<string | undefined>(undefined);
  const [currentDefaultTagAnnotation, setcurrentDefaultTagAnnotation] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [taskStartTime, setTaskStartTime] = useState<number>(new Date().getTime());
  const [inModal, setInModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<ToastMsg | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const taskId: number = parseInt(match.params.annotation_task_id, 10);
    retrieveTask(taskId);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      AnnotationCommentsApiService.shared.abortRequests();
      AnnotationTasksApiService.shared.abortRequests();
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [])

  useEffect(() => {
    const taskId: number = parseInt(match.params.annotation_task_id, 10);
    if (taskId === task?.id) return;
    retrieveTask(taskId);
    setTaskStartTime(new Date().getTime());
  }, [match])

  const retrieveTask = async (taskId: number) =>  {
    // Retrieve current task
    try {
      const task: AnnotationTask = await AnnotationTasksApiService.shared.retrieve(taskId);

      if (task.annotationTags.length < 1 || task.spectroUrls.length < 1) {
        setIsLoading(false);
        setError('Not enough data to retrieve spectrograms' );
      }

      // Computing duration (in seconds)
      setDuration((task.boundaries.endTime.getTime() - task.boundaries.startTime.getTime()) / 1000);
      setFrequencyRange(task.boundaries.endFrequency - task.boundaries.startFrequency);

      // Load previous annotations
      setAnnotations(task.prevAnnotations.map(a => {
        const isBoxAnnotation = (typeof a.startTime === 'number') &&
          (typeof a.endTime === 'number') &&
          (typeof a.startFrequency === 'number') &&
          (typeof a.endFrequency === 'number');

        const comments = a.result_comments;
        if (comments.length < 1) {
          comments.push({
            comment: "",
            annotation_task: task.id,
            annotation_result: a.id ?? null
          });
        }
        return {
          type: isBoxAnnotation ? 'box' : 'tag',
          id: a.id,
          annotation: a.annotation,
          startTime: isBoxAnnotation ? a.startTime ?? 0 : -1,
          endTime: isBoxAnnotation ? a.endTime ?? 0 : -1,
          startFrequency: isBoxAnnotation ? a.startFrequency ?? 0 : -1,
          endFrequency: isBoxAnnotation ? a.endFrequency ?? 0 : -1,
          active: false,
          result_comments: comments
        }
      }));

      const comment: Comment = task.taskComment[0] ?? { comment: "", annotation_task: task.id, annotation_result: null };
      setTaskComment(comment)
      setCurrentComment(comment)

      // Finally, setting state
      setSelectedPresences(new Set(task.prevAnnotations.map(a => a.annotation)));
      setTagColors(buildTagColors(task.annotationTags))
      setTask(task)
      setCurrentDefaultConfidenceIndicator(task.confidenceIndicatorSet?.confidenceIndicators.find((confidenceIndicator) => confidenceIndicator.isDefault)?.label)
      setIsLoading(false);
      setError(undefined);
    } catch (e) {
      setIsLoading(false);
      setError(buildErrorMessage(e));
    }
  }

  const handleKeyPress = (event: any) => {
    const active_alphanumeric_keys = alphanumeric_keys[0].slice(0, task!.annotationTags.length);

    if (inModal) return

    if (event.code === "Space") {
      event.preventDefault();
      checkAndSubmitAnnotations();
      return
    }

    if (event.key === "ArrowLeft" && task!.prevAndNextAnnotation.prev !== "") {
      history.push('/audio-annotator/' + task!.prevAndNextAnnotation.prev);
    }

    if (event.key === "ArrowRight" && task!.prevAndNextAnnotation.next !== "") {
      history.push('/audio-annotator/' + task!.prevAndNextAnnotation.next);

    }

    if (event.key === "'") {
      event.preventDefault();
    }

    active_alphanumeric_keys.forEach((value, index) => {
      const tag = task!.annotationTags[index];

      if (event.key === value || event.key === alphanumeric_keys[1][index]) {
        setcurrentDefaultTagAnnotation(task!.annotationTags[index])

        if (task?.annotationScope === AnnotationMode.boxes) {
          toggleAnnotationTag(tag);
          return
        }

        if (annotations.length === 0) {
          toggleGlobalTag(tag);
          setSelectedPresences(selectedPresences.add(tag))
          return;
        }
        if (selectedPresences.has(tag)) {
          if (getCurrentTag() === tag) {
            /** Delete all annotations and annotations TYPE_TAG */
            toggleGlobalTag(tag);
          } else {
            //Change tag of this annotation
            toggleAnnotationTag(tag);
          }
        } else {
          /** Create a new annotation TYPE_TAG */
          toggleGlobalTag(tag);
        }
      }
    })
  }

  const buildErrorMessage = (err: any) => {
    if (err !== null && typeof err === 'object' && err.status && err.message) {
      return 'Status: ' + err.status.toString() +
        ' - Reason: ' + err.message +
        (err.response.body.title ? ` - ${ err.response.body.title }` : '') +
        (err.response.body.detail ? ` - ${ err.response.body.detail }` : '');
    } else if (typeof err === 'string') {
      return err;
    } else {
      return err?.toString();
    }
  }

  const seekTo = (newTime: number): void => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.currentTime = newTime;
    updateProgress(newTime);
  }

  const playPause = (): void => {
    if (!audioPlayerRef.current) return;
    if (audioPlayerRef.current.paused) {
      play();
    } else {
      pause();
    }
  }

  const play = (annotation?: Annotation): void => {
    if (!audioPlayerRef.current) return;
    if (annotation) {
      audioPlayerRef.current.currentTime = annotation.startTime;
      activateAnnotation(annotation);
    }
    audioPlayerRef.current.play();

    setStopTime(annotation?.endTime);
  }

  const pause = (): void => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.pause();
    setStopTime(undefined);
  }

  const updateProgress = (seconds: number): void => {
    if (stopTime && (seconds > stopTime)) {
      pause();
    } else {
      setCurrentTime(seconds);
    }
  }

  const getCurrentTag = () => {
    const activeTag = annotations.find((ann: Annotation) => ann.active && ann.annotation);
    if (activeTag) {
      return activeTag.annotation;
    }
    return "";
  };

  const saveAnnotation = (annotation: Annotation) => {
    const isPresenceMode = task?.annotationScope === AnnotationMode.wholeFile;

    const maxId: number | undefined = annotations
      .map(ann => ann.id ?? 0)
      .sort((a, b) => b - a)
      .shift();

    const newId: string = maxId ? `${ (maxId + 1).toString() }` : `1`;

    if (isPresenceMode) {
      if (annotation.type === TYPE_BOX) {
        const newAnnotation: Annotation = Object.assign(
          {}, annotation, {
            id: parseInt(newId, 10),
            annotation: getCurrentTag(),
            result_comments: [{
              comment: "",
              annotation_result: parseInt(newId, 10),
              annotation_task: task!.id,
              newAnnotation: true,
            }]
          }
        );
        activateAnnotation(newAnnotation);
      } else {
        // Type: TYPE_TAG
        const newAnnotation: Annotation = Object.assign(
          {},
          annotation,
          {
            id: parseInt(newId, 10),
            result_comments: [Object.assign({}, annotation.result_comments, {
              annotation_result: parseInt(newId, 10)
            })]
          }
        );

        setSelectedPresences(selectedPresences.add(annotation.annotation));

        activateAnnotation(newAnnotation);
      }
    } else {
      const newAnnotation: Annotation = Object.assign(
        {}, annotation, {
          id: parseInt(newId, 10),
          result_comments: [{
            comment: "",
            annotation_result: parseInt(newId, 10),
            annotation_task: task!.id,
            newAnnotation: true,
          }],
        }
      );

      if (annotations.length === 0) {
        setToastMessage({
          lvl: 'primary',
          msg: 'Select a tag to annotate the box.'
        })
      }
      activateAnnotation(newAnnotation);
    }
  }

  const updateAnnotation = (annotation: Annotation) => {
    setAnnotations(annotations
      .filter(ann => ann.id !== annotation.id)
      .concat(annotation));
  }

  const deleteAnnotation = (annotation: Annotation) => {
    setAnnotations(annotations.filter(ann => ann.id !== annotation.id));
  }

  const activateAnnotation = (annotation: Annotation): void => {
    const activated: Annotation = Object.assign(
      {}, annotation, { active: true }
    );

    const newAnnotations: Array<Annotation> = annotations
      .filter(ann => ann.id !== activated.id)
      .map(ann => Object.assign({}, ann, { active: false }))
      .concat(activated);
    setAnnotations(newAnnotations)

    setCurrentComment(getCurrentComment(newAnnotations));
    setcurrentDefaultTagAnnotation(activated.annotation);
    setCurrentDefaultConfidenceIndicator(activated.confidenceIndicator);
  }

  const toggleAnnotationTag = (tag: string) => {
    const activeAnn: Annotation | undefined = annotations
      .find(ann => ann.type === TYPE_BOX && ann.active);

    if (activeAnn) {
      const newTag: string = (activeAnn.annotation === tag) ? '' : tag;
      const newAnnotation: Annotation = Object.assign(
        {}, activeAnn, { annotation: newTag, }
      );
      const newAnnotations: Array<Annotation> = annotations
        .filter(ann => !ann.active)
        .concat(newAnnotation);
      setAnnotations(newAnnotations);

      setCurrentComment(getCurrentComment(newAnnotations));
      setcurrentDefaultTagAnnotation(tag);
      setToastMessage(undefined);
    }
  }

  const toggleAnnotationConfidence = (confidenceIndicator: string) => {
    const activeAnn: Annotation | undefined = annotations
      .find(ann => ann.active);

    if (activeAnn) {
      const newConfidence: string = (activeAnn.confidenceIndicator === confidenceIndicator) ? '' : confidenceIndicator;
      const newAnnotation: Annotation = Object.assign(
        {}, activeAnn, { confidenceIndicator: newConfidence, }
      );
      setAnnotations(annotations
        .filter(ann => !ann.active)
        .concat(newAnnotation));

      setToastMessage(undefined)
      setCurrentDefaultConfidenceIndicator(confidenceIndicator)
    }
  }

  const toggleGlobalTag = (tag: string) => {
    if (selectedPresences.has(tag)) {
      deleteAnnotationInPresenceMode(tag)
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
        confidenceIndicator: currentDefaultTagAnnotation,
        active: true,
        result_comments: [],
      };
      saveAnnotation(newAnnotation);
    }
  }

  const deleteAnnotationInPresenceMode = async (tag: string) => {
    setInModal(true);

    if (await confirm("Are your sure?")) {
      const newAnnotations: Array<Annotation> = annotations
        .filter(ann => ann.annotation !== tag);

      if (newAnnotations.length > 0) {
        const annotationToActive = newAnnotations.find((ann: Annotation) => ann.type === TYPE_TAG);
        if (annotationToActive) {
          annotationToActive.active = true;
        }
      }

      setAnnotations(newAnnotations);
      selectedPresences.delete(tag);
      setSelectedPresences(selectedPresences);

      setToastMessage(undefined)
    }
    setInModal(false);
  }

  const checkAndSubmitAnnotations = () => {
    const emptyAnnotations = annotations
      .filter((ann: Annotation) => ann.annotation.length === 0);

    let emptyConfidenceIndicator = [];
    if (task?.confidenceIndicatorSet != undefined) {
      emptyConfidenceIndicator = annotations
        .filter((ann: Annotation) => ann.confidenceIndicator?.length === 0);
    }

    if (emptyAnnotations.length > 0) {
      activateAnnotation(emptyAnnotations.shift()!);
      setToastMessage({
        lvl: 'danger',
        msg: 'Make sure all your annotations are tagged.'
      })
    } else if (emptyConfidenceIndicator.length > 0) {
      setToastMessage({
        lvl: 'danger',
        msg: 'Make sure all your annotations have a confidence indicator.'
      })
    } else {
      submitAnnotations();
    }
  }

  const cleaningAnnotation = (annotation: Annotation): AnnotationDto => {
    const startTime = annotation.type === TYPE_BOX ? annotation.startTime : null;
    const endTime = annotation.type === TYPE_BOX ? annotation.endTime : null;
    const startFrequency = annotation.type === TYPE_BOX ? annotation.startFrequency : null;
    const endFrequency = annotation.type === TYPE_BOX ? annotation.endFrequency : null;
    const result_comments = annotation.result_comments.filter(c => c.comment.length > 0);
    return {
      id: annotation.id,
      startTime,
      endTime,
      annotation: annotation.annotation,
      startFrequency,
      endFrequency,
      confidenceIndicator: annotation.confidenceIndicator,
      result_comments: result_comments,
    };
  }

  const submitAnnotations = async () => {
    const cleanAnnotations: Array<AnnotationDto> = annotations
      .sort((a, b) => a.startTime - b.startTime)
      .map(ann => cleaningAnnotation(ann));

    try {
      const response = await AnnotationTasksApiService.shared.update(
        task!.id,
        cleanAnnotations,
        Math.floor(taskStartTime / 1000),
        Math.floor(new Date().getTime() / 1000)
      )
      if (this.state.task.prevAndNextAnnotation.next) {
        history.push('/audio-annotator/' + this.state.task.prevAndNextAnnotation.next);
      } else {
        history.push('/annotation_tasks/' + this.state.task.campaignId);
      }

    } catch (e) {
      setIsLoading(false);
      setError(buildErrorMessage(e));
    }
  }

  const changePlaybackRate = (event: ChangeEvent<HTMLSelectElement>) => {
    setPlaybackRate(+event.target.value);
  }

  const beforeSubmit_checkPresenceMode = async (annotationList: Annotation[]) => {
    if (annotationList[0].annotation.length === 0) {
      setToastMessage({
        lvl: 'danger',
        msg: 'Make sure your annotations is tagged.'
      })
      return
    }

    if (!annotationList[0].confidenceIndicator || annotationList[0].confidenceIndicator.length === 0) {
      setToastMessage({
        lvl: 'danger',
        msg: 'Make sure your annotations have a confidence indicator.'
      })
      return
    }

    const taskId: number = task!.id;
    const isPresenceMode = task?.annotationScope === AnnotationMode.wholeFile;

    // Save new AnnotationTag in PresenceMode
    if (isPresenceMode) {
      const annotationTag: Array<Annotation> = annotations
        .filter(annotation =>
          annotation.type === "tag"
          && annotation.annotation === annotationList[0].annotation
          && !!annotation.result_comments.find(c => c.newAnnotation)
        )

      if (annotationTag.length === 1) {
        // this task need the creation of a new annotation[type: tag] before save the annotation and comment

        try {
          const cleanAnnotation = cleaningAnnotation(annotationList[0]);
          const newTaskID = await AnnotationTasksApiService.shared.addAnnotation(
            taskId,
            cleanAnnotation,
            Math.floor(taskStartTime / 1000),
            Math.floor((new Date()).getTime() / 1000)
          );
          updateAnnotationsWithNewId(cleanAnnotation.id!, newTaskID)
        } catch (e) {
          setIsLoading(false);
          setError(buildErrorMessage(e));
          return;
        }
        }
    }
    // submitOneAnnotationAndAComment
    try {
      const newTaskID = await AnnotationTasksApiService.shared.addAnnotation(
        taskId,
        cleaningAnnotation(annotationList[0]),
        Math.floor(taskStartTime / 1000),
        Math.floor((new Date()).getTime() / 1000)
      );
      setToastMessage({ msg: "This Annotation is saved", lvl: "success" });
      submitComment(newTaskID)
    } catch (e) {
      setIsLoading(false);
      setError(buildErrorMessage(e));
    }
  }

  const updateAnnotationsWithNewId = (oldId: number, newId: number) => {
    if (oldId !== newId) {
      const anotherAnnotationsWithSameId: Array<Annotation> = annotations
        .filter(ann => ann.id === newId)
        .map(ann => Object.assign({}, ann, { id: newId + 1000 }))

      let newAnnotations: Array<Annotation> = annotations
        .filter(ann => ann.id !== newId)
        .concat(anotherAnnotationsWithSameId)

      const annotationsWithNewId: Array<Annotation> = newAnnotations
        .filter(ann => ann.id === oldId)
        .map(ann => Object.assign({}, ann, { id: newId }))

      newAnnotations = newAnnotations
        .filter(ann => ann.id !== oldId)
        .concat(annotationsWithNewId)

      setAnnotations(newAnnotations)

      return annotationsWithNewId
    }
  }

  const submitComment = async (annotation_result_id = currentComment.annotation_result) => {
    /** Don't save new empty comment */
    if (!currentComment.id && currentComment.comment === "") return

    try {
      const response = await AnnotationCommentsApiService.shared.createOrUpdate({
        ...currentComment,
        annotation_result: annotation_result_id,
      });
      const comment: Comment = response.delete ? {
        comment: "",
        annotation_task: currentComment.annotation_task,
        annotation_result: annotation_result_id,
        comment_id: null,
      } as Comment : response;

      if (comment.annotation_result === null) {
        setCurrentComment(comment);
        setTaskComment(comment);
        return;
      }

      let newAnnotations
      if (comment.annotation_result !== annotation_result_id) {

        const anotherAnnotationsWithSameId: Array<Annotation> = annotations
          .filter(a => a.id === annotation_result_id)
          .map(ann => Object.assign({}, ann, { id: (annotation_result_id ?? 0) + 200 }))

        newAnnotations = annotations
          .filter(ann => ann.id !== (annotation_result_id ?? 0) + 200)
          .concat(anotherAnnotationsWithSameId)
      } else {
        newAnnotations = annotations
      }

      const annotationsWithNewComment: Array<Annotation> = newAnnotations
        .filter(ann => ann.id === currentComment.annotation_result)
        .map(ann => Object.assign({}, ann, { result_comments: comment, id: annotation_result_id }))

      newAnnotations = newAnnotations
        .filter(ann => ann.id !== currentComment.annotation_result)
        .concat(annotationsWithNewComment)

      setCurrentComment(comment)
      setAnnotations(newAnnotations)
    } catch (e) {
      setToastMessage({ msg: buildErrorMessage(e), lvl: "danger" } );
    }
  }

  const submitCommentAndAnnotation = () => {
    if (currentComment.newAnnotation) {
      const newAnnotations = annotations.filter((ann) => ann.id === currentComment.annotation_result)
      beforeSubmit_checkPresenceMode(newAnnotations)
    } else {
      submitComment()
    }
  }

  const getCurrentComment = (annotations: Array<Annotation>): Comment => {
    const activeAnn: Annotation | undefined = annotations.find(ann => ann.active);
    let currentComment: Comment;

    if (activeAnn === undefined) {
      currentComment = taskComment;
    } else {
      currentComment = activeAnn.result_comments.length > 0 ? activeAnn.result_comments[0] : {
        comment: '',
        annotation_task: task!.id,
        annotation_result: activeAnn.id ?? 0
      };
    }
    return currentComment
  }

  const switchToTaskComment = (): void => {
    setCurrentComment(taskComment);
    setAnnotations(annotations.map(a => ({...a, active: false})));
  }

    if (isLoading) return <p>Loading...</p>;
    else if (error) return <p>Error while loading task: <code>{ error }</code></p>
    else if (!task) return <p>Unknown error while loading task.</p>

      const playStatusClass = isPlaying ? "fa-pause-circle" : "fa-play-circle";

      // File data
      const fileMetadata: FileMetadata = {
        name: task.audioUrl.split('/').pop() ?? '',
        date: task.boundaries.startTime,
        audioRate: task.audioRate,
      };

      // Displayable annotations (for presence mode)
      const boxAnnotations = annotations.filter((ann: Annotation) => ann.type === TYPE_BOX);

      // Is drawing enabled? (always in box mode, when a tag is selected in presence mode)
      const isDrawingEnabled = !!task && (task.annotationScope === AnnotationMode.boxes || (
        task.annotationScope === AnnotationMode.wholeFile && getCurrentTag() !== ''
      ));

      // Rendering
      return (
        <div className="annotator container-fluid ps-0">

          {/* Header */ }
          <div className="row">
            <h1 className="col-sm-6">APLOSE</h1>
            <p className="col-sm-4 annotator-nav">
              <span>
                <a href="https://github.com/Project-OSmOSE/osmose-app/blob/master/docs/user_guide_annotator.md"
                   rel="noopener noreferrer"
                   target="_blank">
                  <span className="fas fa-question-circle"></span>&nbsp;Annotator User Guide
                </a>
              </span>
              { task?.instructions_url &&
                  <span>
                      <a href={ task.instructions_url }
                         rel="noopener noreferrer"
                         target="_blank">
                          <span className="fas fa-info-circle"></span>&nbsp;Campaign instructions
                      </a>
                  </span> }
            </p>
            <ul className="col-sm-2 annotator-nav">
              <li>
                <Link className="btn btn-danger"
                      to={ `/annotation_tasks/${ task.campaignId }` }
                      title="Go back to annotation campaign tasks">
                  Back to campaign
                </Link>
              </li>
            </ul>
          </div>

          {/* Audio player (hidden) */ }
          <AudioPlayer onListen={ (seconds: number) => updateProgress(seconds) }
                       onLoadedMetadata={ () => updateProgress(0) }
                       ref={ audioPlayerRef  }
                       playbackRate={ playbackRate }
                       src={ task.audioUrl }
                       onPause={ () => setIsPlaying(false) }
                       onAbort={ () => setIsPlaying(false) }
                       onEnded={ () => setIsPlaying(false) }
                       onPlay={ () => setIsPlaying(true) }></AudioPlayer>

          {/* Workbench (spectrogram viz, box drawing) */ }
          <Workbench availableSpectroConfigs={ task.spectroUrls }
                     tagColors={ tagColors }
                     currentTime={ currentTime }
                     duration={ duration }
                     fileMetadata={ fileMetadata }
                     startFrequency={ task.boundaries.startFrequency }
                     frequencyRange={ frequencyRange }
                     annotations={ boxAnnotations }
                     onAnnotationCreated={ saveAnnotation }
                     onAnnotationUpdated={ updateAnnotation }
                     onAnnotationDeleted={ deleteAnnotation }
                     onAnnotationSelected={ activateAnnotation }
                     onAnnotationPlayed={ play }
                     onSeek={ seekTo }
                     drawingEnabled={ isDrawingEnabled }
                     currentDefaultTagAnnotation={ currentDefaultTagAnnotation }
                     currentDefaultConfidenceIndicator={ currentDefaultConfidenceIndicator }
          ></Workbench>

          {/* Toolbar (play button, play speed, submit button, timer) */ }
          <div className="row annotator-controls">
            <p className="col-sm-1 text-right">
              <button className={ `btn-simple btn-play fas ${ playStatusClass }` }
                onClick={ playPause }></button>
            </p>
            <p className="col-sm-1">
              { !!audioPlayerRef.current?.preservesPitch &&
                  <select className="form-control select-rate"
                          defaultValue={ playbackRate }
                          onChange={ changePlaybackRate }>
                    { AVAILABLE_RATES.map(rate => (
                      <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
                    )) }
                  </select> }
            </p>

            <div className="col-sm-5 text-center">
              <OverlayTrigger overlay={
                <div className="card">
                  <h3 className={ `card-header tooltip-header` }>Shortcut</h3>
                  <div className="card-body p-1">
                    <p>
                      <span className="font-italic"><i
                        className="fa fa-arrow-left"></i></span>{ " : load previously recording" }<br/>
                    </p>
                  </div>
                </div>
              }>
                <Link
                  className="btn btn-submit rounded-left rounded-right-0"
                  to={ task.prevAndNextAnnotation.prev === "" ? "#" : `/audio-annotator/${ task.prevAndNextAnnotation.prev }` }>
                  <i className="fa fa-caret-left"></i>
                </Link>
              </OverlayTrigger>
              <OverlayTrigger overlay={
                <div className="card">
                  <h3 className={ `card-header tooltip-header` }>Shortcut</h3>
                  <div className="card-body p-1">
                    <p>
                      <span className="font-italic">Enter</span>{ " : Submit & load next recording" }<br/>
                    </p>
                  </div>
                </div>
              }>
                <button
                  className="btn btn-submit border-radius-0"
                  onClick={ checkAndSubmitAnnotations }
                  type="button"
                >Submit &amp; load next recording
                </button>
              </OverlayTrigger>
              <OverlayTrigger overlay={
                <div className="card">
                  <h3 className={ `card-header tooltip-header` }>Shortcut</h3>
                  <div className="card-body p-1">
                    <p>
                      <span className="font-italic"><i
                        className="fa fa-arrow-right"></i></span>{ " : load next recording" }<br/>
                    </p>
                  </div>
                </div>
              }>
                <Link
                  className="btn btn-submit rounded-right rounded-left-0"
                  to={ task.prevAndNextAnnotation.next === "" ? "#" : `/audio-annotator/${ task.prevAndNextAnnotation.next }` }>
                  <i className="fa fa-caret-right"></i>
                </Link>
              </OverlayTrigger>
            </div>


            <div className="col-sm-3">
              <Toast toastMsg={ toastMessage }></Toast>
            </div>
            <p className="col-sm-2 text-right">
              { utils.formatTimestamp(currentTime) }
              &nbsp;/&nbsp;
              { utils.formatTimestamp(duration) }
            </p>
          </div>

          {/* Tag and annotations management */ }
          { task && <React.Fragment>
              <div className="row justify-content-around m-2">
                  <CurrentAnnotationBloc annotation={ annotations.find(a => a.active) }
                                         taskBoundaries={ task.boundaries }
                                         hasConfidence={ !!task.confidenceIndicatorSet }></CurrentAnnotationBloc>

                  <div className="col-5 flex-shrink-2">
                      <TagListBloc tags={ task.annotationTags }
                                   tagColors={ tagColors }
                                   activeTag={ currentDefaultTagAnnotation }
                                   selectedTags={ [...selectedPresences] }
                                   annotationMode={ task.annotationScope }
                                   onTagSelected={ toggleAnnotationTag }></TagListBloc>

                    {/* Confidence Indicator management */ }
                    { task.confidenceIndicatorSet && currentDefaultTagAnnotation &&
                        <ConfidenceIndicatorBloc set={ task.confidenceIndicatorSet }
                                                 currentIndicator={ currentDefaultTagAnnotation }
                                                 onIndicatorSelected={ toggleAnnotationConfidence }></ConfidenceIndicatorBloc> }
                  </div>

                { task.annotationScope === AnnotationMode.wholeFile &&
                    <PresenceBloc tags={ task.annotationTags }
                                  tagsColors={ tagColors }
                                  selectedTags={ [...selectedPresences] }
                                  onTagSelected={ toggleGlobalTag }></PresenceBloc> }
              </div>

              <div className="row justify-content-center">
                  <AnnotationList annotations={ annotations }
                                  annotationMode={ task.annotationScope }
                                  onAnnotationClicked={ activateAnnotation }></AnnotationList>

                  <CommentBloc currentComment={ currentComment }
                               taskComment={ taskComment }
                               onCommentUpdated={ setCurrentComment }
                               onFocusUpdated={ setInModal }
                               onSubmit={ submitCommentAndAnnotation }
                               switchToTaskComment={ switchToTaskComment }></CommentBloc>
              </div>
          </React.Fragment> }
        </div>
      );
}

export default AudioAnnotator;
