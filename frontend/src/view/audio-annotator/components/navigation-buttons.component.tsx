import React, { Fragment, ReactNode, useEffect, useState } from "react";
import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Link, useHistory } from "react-router-dom";

const NavigationShortcutOverlay: React.FC<{ shortcut: ReactNode; description: string }> = ({
                                                                                            shortcut,
                                                                                            description
                                                                                          }) => (
  <div className="card">
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
)

export const NavigationButtons: React.FC = () => {
  const history = useHistory();
  const { context, keyPressedSubject, tasks } = useAnnotatorService();
  const [siblings, setSiblings] = useState<{prev?: number, next?: number} | undefined>()

  useEffect(() => {
    const sub = keyPressedSubject.subscribe(onKeyPressed);
    return () => {
      sub.unsubscribe();
    }
  }, [])

  useEffect(() => {
    setSiblings(context.task?.prevAndNextAnnotation);
  }, [context.task])

  const onKeyPressed = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        submit();
        break;
      case 'ArrowLeft':
        if (siblings?.prev) {
          history.push(`/audio-annotator/${siblings.prev}`)
        }
        break;
      case 'ArrowRight':
        if (siblings?.next) {
          history.push(`/audio-annotator/${siblings.next}`)
        }
        break;
    }
  }

  const submit = async () => {
    const response = await tasks.save()
    if (!response) return;
    if (response.next_task) {
      history.push(`/audio-annotator/${ response.next_task }`);
    } else {
      history.push(`/annotation_tasks/${ response.campaign_id }`);
    }
  }

  if (!siblings) return <Fragment/>;
  return (
    <div className="col-sm-5 text-center">
      <OverlayTrigger overlay={ <NavigationShortcutOverlay shortcut={ <i className="fa fa-arrow-left"/> }
                                                          description="load previous recording"/> }>
        <Link className="btn btn-submit rounded-left rounded-right-0"
              to={ siblings.prev && `/audio-annotator/${ siblings.prev }` || "#" }>
          <i className="fa fa-caret-left"></i>
        </Link>
      </OverlayTrigger>
      <OverlayTrigger
        overlay={ <NavigationShortcutOverlay shortcut="Enter" description="Submit & load next recording"/> }>
        <button className="btn btn-submit border-radius-0"
                onClick={ submit }
                type="button">
          Submit &amp; load next recording
        </button>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <NavigationShortcutOverlay shortcut={ <i className="fa fa-arrow-right"/> }
                                                          description="load next recording"/> }>
        <Link className="btn btn-submit rounded-right rounded-left-0"
              to={ siblings.next && `/audio-annotator/${ siblings.next }` || "#" }>
          <i className="fa fa-caret-right"></i>
        </Link>
      </OverlayTrigger>
    </div>
  )
}