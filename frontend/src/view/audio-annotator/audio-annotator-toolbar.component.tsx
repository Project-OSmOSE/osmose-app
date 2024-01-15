import React, { Fragment, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useHistory } from "react-router-dom";
import { AudioPlayStatus } from "../../enum";
import { useAudioService } from "../../services/annotator/audio";
import { useTaskService } from "../../services/annotator/task";
import { formatTimestamp } from "../../services/annotator/format/format.util.tsx";
import { ShortcutOverlay, Toast } from "../global-components";

const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

const AudioControls: React.FC = () => {
  const { context, playPause, setPlaybackRate } = useAudioService();

  if (!context.element) return <Fragment/>;

  const playStatusClass: string = context.state === AudioPlayStatus.play ? "fa-pause-circle" : "fa-play-circle";

  return (
    <Fragment>
      <p className="col-sm-1 text-right">
        <button className={ `btn-simple btn-play fas ${ playStatusClass }` }
                onClick={ playPause }></button>
      </p>

      <p className="col-sm-1">
        { context.element.preservesPitch &&
            <select className="form-control select-rate"
                    defaultValue={ context.element.playbackRate }
                    onChange={ (e) => setPlaybackRate(+e.target.value) }>
              { AVAILABLE_RATES.map(rate => (
                <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
              )) }
            </select> }
      </p>
    </Fragment>
  )
}

const AudioTime: React.FC = () => {
  const { context: audioCtx } = useAudioService();
  const { context: taskCtx } = useTaskService();

  if (!audioCtx.element || !taskCtx.currentTask?.duration) return <Fragment/>;

  return (
    <p className="col-sm-2 text-right">
      { formatTimestamp(audioCtx.time) }
      &nbsp;/&nbsp;
      { formatTimestamp(taskCtx.currentTask.duration) }
    </p>
  )
}

export const AudioAnnotatorToolbar: React.FC = () => {
  const { context, submit: _submit } = useTaskService();
  const history = useHistory();

  useEffect(() => {
    // TODO: move in AudioAnnotator.page.tsx
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  }, [])

  if (!context.currentTask) return <Fragment/>;

  const submit = async () => {
    if (!context.currentTask) return;
    const response = await _submit()
    if (response.next_task) {
      history.push(`/audio-annotator/${ response.next_task }`);
    } else {
      history.push(`/annotation_tasks/${ response.campaign_id }`);
    }
  }

  const navigatePrevious = () => {
    const prev = context.currentTask?.prevAndNextAnnotation.prev;
    if (!prev || prev === "") return;
    history.push(`/audio-annotator/${ prev }`);
  }

  const navigateNext = () => {
    const next = context.currentTask?.prevAndNextAnnotation.next;
    if (!next || next === "") return;
    history.push(`/audio-annotator/${ next }`);
  }

  const handleKeyPress = (event: any) => {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        submit();
        return;
      case 'ArrowLeft':
        event.preventDefault();
        navigatePrevious();
        return;
      case 'ArrowRight':
        event.preventDefault();
        navigateNext();
        return;
      case "'":
        event.preventDefault();
        return;
    }
  }

  return (
    <div className="row annotator-controls">
      <AudioControls/>

      <div className="col-sm-5 text-center">
        <OverlayTrigger overlay={ <ShortcutOverlay label="load previous recording"><i
          className="fa fa-arrow-left"/></ShortcutOverlay> }>
          <button className="btn btn-submit rounded-left rounded-right-0"
                  onClick={ navigatePrevious }
                  type="button">
            <i className="fa fa-caret-left"></i>
          </button>
        </OverlayTrigger>

        <OverlayTrigger overlay={ <ShortcutOverlay label="Submit & load next recording"><span
          className="font-italic">Enter</span></ShortcutOverlay> }>
          <button className="btn btn-submit border-radius-0"
                  onClick={ submit }
                  type="button">
            Submit &amp; load next recording
          </button>
        </OverlayTrigger>

        <OverlayTrigger
          overlay={ <ShortcutOverlay label="load next recording"><i className="fa fa-arrow-right"/></ShortcutOverlay> }>
          <button className="btn btn-submit rounded-right rounded-left-0"
                  onClick={ navigateNext }
                  type="button">
            <i className="fa fa-caret-right"></i>
          </button>
        </OverlayTrigger>
      </div>

      <div className="col-sm-3">
        <Toast toastMsg={ context.toast }></Toast>
      </div>

      <AudioTime/>
    </div>
  )
}