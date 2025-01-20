import React, { useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IonButton, IonIcon } from "@ionic/react";
import { caretBack, caretForward } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { useAnnotatorSubmitService } from "@/services/annotator/submit.service.ts";
import { useAlert, useToast } from "@/service/ui";
import { getErrorMessage } from '@/service/function.ts';
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { Kbd, TooltipOverlay } from "@/components/ui";
import styles from '../annotator-tools.module.scss'
import { useKbdEvents } from "@/service/events";


export interface KeypressHandler {
  handleKeyPressed: (event: KeyboardEvent) => void;
}

export const NavigationButtons: React.FC = () => {
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery(params)

  // Services
  const history = useHistory();
  const submitService = useAnnotatorSubmitService();
  const toast = useToast();
  const alert = useAlert();
  const kbdEvent = useKbdEvents();

  // Data
  const {
    hasChanged: _hasChanged,
  } = useAppSelector(state => state.annotator);

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

  useEffect(() => {
    kbdEvent.down.add(onKbdEvent);

    return () => {
      kbdEvent.down.remove(onKbdEvent);
    }
  }, []);

  function onKbdEvent(event: KeyboardEvent) {
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

  const submit = async () => {
    isSubmitting.current = true;
    try {
      await submitService.submit()
      if (next_file_id.current) {
        history.push(`/annotation-campaign/${ params.campaignID }/file/${ next_file_id.current }/new`);
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
      await alert.present({
        message: `You have unsaved changes. Are you sure you want to forget all of them?`,
        cssClass: 'danger-confirm-alert',
        buttons: [
          'Cancel',
          {
            text: `Forget my changes`,
            cssClass: 'ion-color-danger',
            handler: () => history.push(`/annotation-campaign/${ params.campaignID }/file/${ previous_file_id.current }/new`)
          }
        ]
      })
    } else
      history.push(`/annotation-campaign/${ params.campaignID }/file/${ previous_file_id.current }/new`);
  }
  const navNext = async () => {
    if (!next_file_id.current) return;
    if (hasChanged.current) {
      await alert.present({
        message: `You have unsaved changes. Are you sure you want to forget all of them?`,
        cssClass: 'danger-confirm-alert',
        buttons: [
          'Cancel',
          {
            text: `Forget my changes`,
            cssClass: 'ion-color-danger',
            handler: () => history.push(`/annotation-campaign/${ params.campaignID }/file/${ next_file_id.current }/new`)
          }
        ]
      })
    } else
      history.push(`/annotation-campaign/${ params.campaignID }/file/${ next_file_id.current }/new`);
  }

  return (
    <div className={ styles.navigation }>
      <TooltipOverlay title='Shortcut' tooltipContent={ <p><Kbd keys='left'/> : Load previous recording</p> }>
        <IonButton color='medium' fill='clear' size='small'
                   disabled={ isSubmitting.current || previous_file_id.current === null }
                   onClick={ navPrevious }>
          <IonIcon icon={ caretBack } slot='icon-only'/>
        </IonButton>
      </TooltipOverlay>
      <TooltipOverlay title='Shortcut' tooltipContent={ <p><Kbd keys='enter'/> : Submit & load next recording</p> }>
        <IonButton color='medium' fill='outline'
                   disabled={ isSubmitting.current }
                   onClick={ submit }>
          Submit &amp; load next recording
        </IonButton>
      </TooltipOverlay>
      <TooltipOverlay title='Shortcut' tooltipContent={ <p><Kbd keys='right'/> : Load next recording</p> }>
        <IonButton color='medium' fill='clear' size='small'
                   disabled={ isSubmitting.current || next_file_id.current === null }
                   onClick={ navNext }>
          <IonIcon icon={ caretForward } slot='icon-only'/>
        </IonButton>
      </TooltipOverlay>
    </div>
  )
}
