import React, { Fragment, ReactNode, useContext, useEffect, useImperativeHandle, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useHistory } from "react-router-dom";
import { KeypressHandler } from "../audio-annotator.page.tsx";
import { useAnnotationTaskAPI } from "../../../services/api";
import {
  AnnotationsContext
} from "../../../services/annotator/annotations/annotations.context.tsx";
import { AnnotationType } from "../../../enum/annotation.enum.tsx";
import { AnnotatorContext } from "../../../services/annotator/annotator.context.tsx";
import { confirm } from "../../global-components";
import Tooltip from "react-bootstrap/Tooltip";

interface Props {
  shortcut: ReactNode;
  description: string;
}

export const NavigationShortcutOverlay = React.forwardRef<HTMLDivElement, Props>(({
                                                                             shortcut,
                                                                             description,
                                                                           }, ref) => (
  <div className="card" ref={ ref }>
    <h3 className={ `card-header tooltip-header` }>Shortcut</h3>
    <div className="card-body p-1">
      <p>
        <span className="font-italic">
          { shortcut }
        </span>
        { ` : ${ description }` }<br/>
      </p>
    </div>
  </div>
))

export const NavigationButtons = React.forwardRef<KeypressHandler, { start: Date }>(({ start }, ref) => {
  const history = useHistory();
  const context = useContext(AnnotatorContext);
  const [siblings, setSiblings] = useState<{ prev?: number, next?: number } | undefined>()
  const taskAPI = useAnnotationTaskAPI();
  const resultsContext = useContext(AnnotationsContext);

  useEffect(() => {
    setSiblings(context.prevAndNextAnnotation);
  }, [context.prevAndNextAnnotation])

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!context.areShortcutsEnabled) return;
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        event.preventDefault();
        submit();
        break;
      case 'ArrowLeft':
        navPrevious();
        break;
      case 'ArrowRight':
        navNext();
        break;
    }
  }

  useImperativeHandle(ref, () => ({ handleKeyPressed }))

  const submit = async () => {
    const now = new Date().getTime();
    const response = await taskAPI.update(context.taskId!, {
      annotations: resultsContext.results.map(r => {
        const isBox = r.type === AnnotationType.box;
        const startTime = isBox ? r.startTime : null;
        const endTime = isBox ? r.endTime : null;
        const startFrequency = isBox ? r.startFrequency : null;
        const endFrequency = isBox ? r.endFrequency : null;
        const result_comments = r.result_comments.filter(c => c.comment.length > 0);
        return {
          id: r.id,
          startTime,
          endTime,
          annotation: r.annotation,
          startFrequency,
          endFrequency,
          confidenceIndicator: r.confidenceIndicator ?? null,
          result_comments: result_comments,
          validation: context.mode === 'Create' ? null : r.validation
        };

      }),
      task_start_time: Math.floor((start.getTime() ?? now) / 1000),
      task_end_time: Math.floor(new Date().getTime() / 1000),
      task_comments: resultsContext.taskComment.comment ? [resultsContext.taskComment] : []
    })


    if (!response) return;
    if (siblings?.next) {
      history.push(`/audio-annotator/${ siblings.next }`);
    } else {
      history.push(`/annotation_tasks/${ context.campaignId }`)
    }
  }

  const navPrevious = async () => {
    if (!siblings?.prev) return;
    if (resultsContext.hasChanged) {
      const response = await confirm(`You have unsaved changes. Are you sure you want to forget all of them ?`, `Forget my changes`);
      if (!response) return;
    }
    history.push(`/audio-annotator/${ siblings.prev }`)
  }
  const navNext = async () => {
    if (!siblings?.next) return;
    if (resultsContext.hasChanged) {
      const response = await confirm(`You have unsaved changes. Are you sure you want to forget all of them ?`, `Forget my changes`);
      if (!response) return;
    }
    history.push(`/audio-annotator/${ siblings.next }`)
  }

  if (!siblings) return <Fragment/>;
  return (
    <div className="col-sm-5 text-center">
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut={ <i className="fa fa-arrow-left"/> }
        description="load previous recording"/></Tooltip> }>
        <button className="btn btn-submit rounded-left rounded-right-0"
                onClick={ navPrevious }>
          <i className="fa fa-caret-left"></i>
        </button>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut="Enter" description="Submit & load next recording"/></Tooltip> }>
        <button className="btn btn-submit border-radius-0"
                onClick={ submit }
                type="button">
          Submit &amp; load next recording
        </button>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut={ <i className="fa fa-arrow-right"/> }
                                                                    description="load next recording"/></Tooltip> }>
        <button className="btn btn-submit rounded-right rounded-left-0"
                onClick={ navNext }>
          <i className="fa fa-caret-right"></i>
        </button>
      </OverlayTrigger>
    </div>
  )
})
