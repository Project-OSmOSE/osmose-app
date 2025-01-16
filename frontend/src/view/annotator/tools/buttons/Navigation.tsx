import React, { ReactNode, useEffect, useImperativeHandle, useRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useHistory, useParams } from "react-router-dom";
import { confirm } from "@/view/global-components";
import Tooltip from "react-bootstrap/Tooltip";
import { IonButton, IonIcon } from "@ionic/react";
import { caretBack, caretForward } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { useAnnotatorSubmitService } from "@/services/annotator/submit.service.ts";
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { Kbd } from "@/components/ui";
import styles from '../annotator-tools.module.scss'

interface Props {
  shortcut: ReactNode;
  description: string;
}

export interface KeypressHandler {
  handleKeyPressed: (event: KeyboardEvent) => void;
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

export const NavigationButtons = React.forwardRef<KeypressHandler, {}>((_, ref) => {
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery(params)

  // Services
  const history = useHistory();
  const submitService = useAnnotatorSubmitService();
  const toast = useToast();

  // Data
  const {
    ui,
    hasChanged: _hasChanged,
  } = useAppSelector(state => state.annotator);

  const areShortcutsEnabled = useRef<boolean>(ui.areShortcutsEnabled);
  useEffect(() => {
    areShortcutsEnabled.current = ui.areShortcutsEnabled
  }, [ ui.areShortcutsEnabled ]);

  const previous_file_id = useRef<number | null>(data?.previous_file_id ?? null);
  useEffect(() => {
    previous_file_id.current = data?.previous_file_id ?? null;
  }, [ data?.previous_file_id ]);
  const next_file_id = useRef<number | null>(data?.next_file_id ?? null);
  useEffect(() => {
    next_file_id.current = data?.next_file_id ?? null;
  }, [ data?.next_file_id ]);

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
        history.push(`/annotation-campaign/${ params.campaignID }/file/${ next_file_id.current }`);
      } else {
        history.push(`/annotation-campaign/${ params.campaignID }`)
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
    history.push(`/annotation-campaign/${ params.campaignID }/file/${ previous_file_id.current }`);
  }
  const navNext = async () => {
    if (!next_file_id.current) return;
    if (hasChanged.current) {
      const response = await confirm(`You have unsaved changes. Are you sure you want to forget all of them ?`, `Forget my changes`);
      if (!response) return;
    }
    history.push(`/annotation-campaign/${ params.campaignID }/file/${ next_file_id.current }`);
  }

  return (
    <div className={ styles.navigation }>
      <OverlayTrigger overlay={ <Tooltip><Kbd keys='left'/></Tooltip> }>
        <IonButton color='medium' fill='clear' size='small'
                   disabled={ isSubmitting.current || previous_file_id.current === null }
                   onClick={ navPrevious }>
          <IonIcon icon={ caretBack } slot='icon-only'/>
        </IonButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><Kbd keys='enter'/></Tooltip> }>
        <IonButton color='medium' fill='outline'
                   disabled={ isSubmitting.current }
                   onClick={ submit }>
          Submit &amp; load next recording
        </IonButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={ <Tooltip><Kbd keys='right'/></Tooltip> }>
        <IonButton color='medium' fill='clear' size='small'
                   disabled={ isSubmitting.current || next_file_id.current === null }
                   onClick={ navNext }>
          <IonIcon icon={ caretForward } slot='icon-only'/>
        </IonButton>
      </OverlayTrigger>
    </div>
  )
})
