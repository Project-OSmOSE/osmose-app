import React, { ReactNode, useEffect, useImperativeHandle, useRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useHistory } from "react-router-dom";
import { KeypressHandler } from "../audio-annotator.page.tsx";
import { confirm } from "../../global-components";
import Tooltip from "react-bootstrap/Tooltip";
import { IonButton, IonIcon } from "@ionic/react";
import { caretBack, caretForward } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { useAnnotatorSubmitService } from "@/services/annotator/submit.service.ts";
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';

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

export const NavigationButtons = React.forwardRef<KeypressHandler, {
  campaignID: string
}>(({ campaignID }, ref) => {
  // Services
  const history = useHistory();
  const submitService = useAnnotatorSubmitService();
  const toast = useToast();

  // Data
  const {
    previous_file_id: _previous_file_id,
    next_file_id: _next_file_id,
    ui,
    hasChanged: _hasChanged,
  } = useAppSelector(state => state.annotator);

  const areShortcutsEnabled = useRef<boolean>(ui.areShortcutsEnabled);
  useEffect(() => {
    areShortcutsEnabled.current = ui.areShortcutsEnabled
  }, [ ui.areShortcutsEnabled ]);

  const previous_file_id = useRef<number | null>(_previous_file_id ?? null);
  useEffect(() => {
    previous_file_id.current = _previous_file_id ?? null;
  }, [ _previous_file_id ]);
  const next_file_id = useRef<number | null>(_next_file_id ?? null);
  useEffect(() => {
    next_file_id.current = _next_file_id ?? null;
  }, [ _next_file_id ]);

  const hasChanged = useRef<boolean>(_hasChanged);
  useEffect(() => {
    hasChanged.current = _hasChanged
  }, [ _hasChanged ]);

  const isSubmitting = useRef<boolean>(false);

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!areShortcutsEnabled.current) return;
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

  useImperativeHandle(ref, () => ({ handleKeyPressed }), [ areShortcutsEnabled ])

  const submit = async () => {
    isSubmitting.current = true;
    try {
      await submitService.submit()
      if (next_file_id.current) {
        history.push(`/annotation-campaign/${ campaignID }/file/${ next_file_id.current }`);
      } else {
        history.push(`/annotation-campaign/${ campaignID }/file`)
      }
    } catch (e: any) {
      toast.presentError(getErrorMessage(e))
    } finally {
      isSubmitting.current = false;
    }
  }

  const navPrevious = async () => {
    if (!previous_file_id.current) return;
    if (hasChanged.current) {
      const response = await confirm(`You have unsaved changes. Are you sure you want to forget all of them ?`, `Forget my changes`);
      if (!response) return;
    }
    history.push(`/annotation-campaign/${ campaignID }/file/${ previous_file_id.current }`);
  }
  const navNext = async () => {
    if (!next_file_id.current) return;
    if (hasChanged.current) {
      const response = await confirm(`You have unsaved changes. Are you sure you want to forget all of them ?`, `Forget my changes`);
      if (!response) return;
    }
    history.push(`/annotation-campaign/${ campaignID }/file/${ next_file_id.current }`);
  }

  return (
    <div className="col-sm-5 d-flex justify-content-center">
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut={ <IonIcon icon={ caretBack }/> }
                                                                    description="load previous recording"/></Tooltip> }>
        <IonButton color={ "primary" }
                   disabled={ isSubmitting.current || previous_file_id.current === null }
                   className="rounded-right-0"
                   onClick={ navPrevious }>
          <IonIcon icon={ caretBack } slot={ "icon-only" }/>
        </IonButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut="Enter"
                                                                    description="Submit & load next recording"/></Tooltip> }>
        <IonButton color={ "primary" }
                   disabled={ isSubmitting.current }
                   className="rounded-0"
                   onClick={ submit }>
          Submit &amp; load next recording
        </IonButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><NavigationShortcutOverlay shortcut={ <IonIcon icon={ caretForward }/> }
                                                                    description="load next recording"/></Tooltip> }>
        <IonButton color={ "primary" }
                   disabled={ isSubmitting.current || next_file_id.current === null }
                   className="rounded-left-0"
                   onClick={ navNext }>
          <IonIcon icon={ caretForward } slot={ "icon-only" }/>
        </IonButton>
      </OverlayTrigger>
    </div>
  )
})
