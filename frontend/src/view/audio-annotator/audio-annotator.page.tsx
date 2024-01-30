import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AudioPlayer, AudioPlayerComponent } from './components/audio-player.component.tsx';
import Workbench from './components/workbench.component.tsx';

import '../../css/annotator.css';
import { CommentBloc } from "./components/bloc/comment-bloc.component.tsx";
import { AnnotationList } from "./components/bloc/annotation-list.component.tsx";
import { PresenceBloc } from "./components/bloc/presence-bloc.component.tsx";
import { ConfidenceIndicatorBloc } from "./components/bloc/confidence-indicator-bloc.component.tsx";
import { TagListBloc } from "./components/bloc/tag-list-bloc.component.tsx";
import { CurrentAnnotationBloc } from "./components/bloc/current-annotation-bloc.component.tsx";

import { useAnnotatorService } from "../../services/annotator/annotator.service.tsx";
import { formatTimestamp } from "../../services/annotator/format/format.util.tsx";
import { Toast, confirm } from "../global-components";
import { AnnotationMode } from "../../enum/annotation.enum.tsx";
import { Annotation } from "../../interface/annotation.interface.tsx";
import { AnnotationComment } from "../../interface/annotation-comment.interface.tsx";
import { NavigationButtons } from "./components/navigation-buttons.component.tsx";
import { AnnotationType } from "../../enum/annotation.enum.tsx";
import { useAudioContext } from "../../services/annotator/audio/audio.context.tsx";

// Playback rates
const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

export type SpectroUrlsParams = {
  nfft: number,
  winsize: number,
  overlap: number,
  urls: Array<string>,
};

export type AnnotationDto = {
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<AnnotationComment>,
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

export type AnnotationTask = {
  id: number,
  annotationTags: Array<string>,
  confidenceIndicatorSet?: ConfidenceIndicatorSet,
  taskComment: Array<AnnotationComment>,
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


export const AudioAnnotator: React.FC = () => {
  const { id: taskID } = useParams<{ id: string }>();

  const {
    context,
    load, abort, endLoading,
    errors,
    shortcuts,
    toasts,
    annotations,
    tags,
  } = useAnnotatorService();

  const audioContext = useAudioContext();
  const audioPlayerRef = useRef<AudioPlayer>(null);

  useEffect(() => {
    let isCancelled = false;
    load(taskID)
      .catch((e: any) => !isCancelled && errors.set(e))
      .finally(() => !isCancelled && endLoading())

    return () => {
      isCancelled = true;
      abort();
    }
  }, [taskID])


  const saveAnnotation = (annotation: Annotation) => {
    const isPresenceMode = context.task?.annotationScope === AnnotationMode.wholeFile;

    const maxId: number | undefined = context.annotations.array
      .map(ann => ann.id ?? 0)
      .sort((a, b) => b - a)
      .shift();

    const newId: string = maxId ? `${ (maxId + 1).toString() }` : `1`;

    if (isPresenceMode) {
      if (annotation.type === AnnotationType.box) {
        annotations.focus({
          ...annotation,
          id: parseInt(newId, 10),
          annotation: context.annotations.focus?.annotation ?? '',
          result_comments: [{
            comment: "",
            annotation_result: parseInt(newId, 10),
            annotation_task: context.task!.id,
            newAnnotation: true,
          }]
        });
      } else {
        // Type: TYPE_TAG
        tags.add(annotation.annotation);
        annotations.focus({
          ...annotation,
          id: +newId,
          result_comments: annotation.result_comments.map((c: AnnotationComment) => ({ ...c, id: +newId }))
        });
      }
    } else {
      if (context.annotations.array.length === 0) {
        toasts.setPrimary('Select a tag to annotate the box.')
      }

      annotations.focus({
        ...annotation,
        id: +newId,
        result_comments: [{
          comment: "",
          annotation_result: +newId,
          annotation_task: context.task!.id,
          newAnnotation: true,
        }]
      });
    }
  }

  const toggleGlobalTag = (tag: string) => {
    if (context.tags.array.includes(tag)) {
      deleteAnnotationInPresenceMode(tag)
    } else {
      // Tag is not present: create it
      const newAnnotation: Annotation = {
        type: AnnotationType.tag,
        id: undefined,
        annotation: tag,
        startTime: -1,
        endTime: -1,
        startFrequency: -1,
        endFrequency: -1,
        confidenceIndicator: context.confidences.focus,
        result_comments: [],
      };
      saveAnnotation(newAnnotation);
    }
  }

  const deleteAnnotationInPresenceMode = async (tag: string) => {
    shortcuts.disable();

    if (await confirm("Are your sure?")) {
      const newAnnotations: Array<Annotation> = context.annotations.array
        .filter(ann => ann.annotation !== tag);
      annotations.updateList(newAnnotations);

      const annotationToActive = newAnnotations.find((ann: Annotation) => ann.type === AnnotationType.tag);
      if (annotationToActive) {
        annotations.focus(annotationToActive);
      }

      tags.remove(tag);
      toasts.remove();
    }
    shortcuts.enable();
  }

  const playPause = () => {
    try {
      if (audioContext.isPaused) audioPlayerRef.current?.play();
      else audioPlayerRef.current?.pause();
    } catch (e) {
      console.warn(e);
    }
  }

  const playStatusClass = useMemo(
    () => audioContext.isPaused ? "fa-play-circle" : "fa-pause-circle",
    [audioContext.isPaused]
  );

  if (context.isLoading) return <p>Loading...</p>;
  else if (context.error) return <p>Error while loading task: <code>{ context.error }</code></p>
  else if (!context.task) return <p>Unknown error while loading task.</p>

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
          { context.task?.instructions_url &&
              <span>
                      <a href={ context.task.instructions_url }
                         rel="noopener noreferrer"
                         target="_blank">
                          <span className="fas fa-info-circle"></span>&nbsp;Campaign instructions
                      </a>
                  </span> }
        </p>
        <ul className="col-sm-2 annotator-nav">
          <li>
            <Link className="btn btn-danger"
                  to={ `/annotation_tasks/${ context.task.campaignId }` }
                  title="Go back to annotation campaign tasks">
              Back to campaign
            </Link>
          </li>
        </ul>
      </div>

      {/* Audio player (hidden) */ }
      <AudioPlayerComponent ref={ audioPlayerRef }/>

      {/* Workbench (spectrogram viz, box drawing) */ }
      <Workbench onAnnotationCreated={ saveAnnotation }
                 audioPlayer={ audioPlayerRef.current }/>

      {/* Toolbar (play button, play speed, submit button, timer) */ }
      <div className="row annotator-controls">
        <p className="col-sm-1 text-right">
          <button className={ `btn-simple btn-play fas ${ playStatusClass }` }
                  onClick={ () => playPause() }></button>
        </p>
        <p className="col-sm-1">
          { audioContext.canPreservePitch &&
              <select className="form-control select-rate"
                      defaultValue={ audioContext.playbackRate }
                      onChange={ e => audioPlayerRef.current?.setPlaybackRate(+e.target.value) }>
                { AVAILABLE_RATES.map(rate => (
                  <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
                )) }
              </select>
          }
        </p>

        <NavigationButtons/>

        <div className="col-sm-3">
          <Toast toastMessage={ context.toast }/>
        </div>
        <p className="col-sm-2 text-right">
          { formatTimestamp(audioContext.time) }
          &nbsp;/&nbsp;
          { formatTimestamp(context.task!.duration) }
        </p>
      </div>

      {/* Tag and annotations management */ }
      <div className="row justify-content-around m-2">
        <CurrentAnnotationBloc/>

        <div className="col-5 flex-shrink-2">
          <TagListBloc/>

          <ConfidenceIndicatorBloc/>
        </div>

        <PresenceBloc onTagSelected={ toggleGlobalTag }/>
      </div>

      <div className="row justify-content-center">
        <AnnotationList/>

        <CommentBloc/>
      </div>
    </div>
  );
}

