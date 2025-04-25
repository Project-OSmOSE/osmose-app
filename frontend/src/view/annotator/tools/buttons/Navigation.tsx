import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IonButton, IonIcon } from "@ionic/react";
import { caretBack, caretForward } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { useAnnotatorSubmitService } from "@/services/annotator/submit.service.ts";
import { useToast } from "@/service/ui";
import { Kbd, TooltipOverlay } from "@/components/ui";
import styles from '../annotator-tools.module.scss'
import { KEY_DOWN_EVENT } from "@/service/events";
import { useAnnotator, useCanNavigate } from "@/service/annotator/hook.ts";


export const NavigationButtons: React.FC = () => {
  const {
    campaignID,
    annotatorData,
  } = useAnnotator();

  // Services
  const navigate = useNavigate();
  const submitService = useAnnotatorSubmitService();
  const toast = useToast();

  // Data
  const {
    didSeeAllFile: _didSeeAllFile,
  } = useAppSelector(state => state.annotator);

  const previous_file_id = useRef<number | null>(annotatorData?.previous_file_id ?? null);
  useEffect(() => {
    previous_file_id.current = annotatorData?.previous_file_id ?? null;
  }, [ annotatorData?.previous_file_id ]);
  const next_file_id = useRef<number | null>(annotatorData?.next_file_id ?? null);
  useEffect(() => {
    next_file_id.current = annotatorData?.next_file_id ?? null;
  }, [ annotatorData?.next_file_id ]);
  const didSeeAllFile = useRef<boolean>(_didSeeAllFile);
  useEffect(() => {
    didSeeAllFile.current = _didSeeAllFile;
  }, [ _didSeeAllFile ]);

  const isSubmitting = useRef<boolean>(false);

  const canNavigate = useCanNavigate()

  useEffect(() => {
    KEY_DOWN_EVENT.add(onKbdEvent);
    return () => {
      KEY_DOWN_EVENT.remove(onKbdEvent);
    }
  }, []);

  function onKbdEvent(event: KeyboardEvent) {
    switch (event.code) {
      case 'Enter':
      case 'Tab':
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
    if (!didSeeAllFile.current) {
      const force = await toast.presentError('Be careful, you haven\' see all of the file yet. Try scrolling to the end or changing the zoom level', true, 'Force');
      if (!force) return;
    }
    isSubmitting.current = true;
    try {
      await submitService.submit()
      if (next_file_id.current) {
        navigate(`/annotation-campaign/${ campaignID }/file/${ next_file_id.current }`);
      } else {
        navigate(`/annotation-campaign/${ campaignID }`)
      }
    } catch (e: any) {
      toast.presentError(e)
    } finally {
      isSubmitting.current = false;
    }
  }

  const navPrevious = async () => {
    if (!previous_file_id.current) return;
    if (await canNavigate())
      navigate(`/annotation-campaign/${ campaignID }/file/${ previous_file_id.current }`);
  }
  const navNext = async () => {
    if (!next_file_id.current) return;
    if (await canNavigate())
      navigate(`/annotation-campaign/${ campaignID }/file/${ next_file_id.current }`);
  }

  if (!annotatorData?.is_assigned) return <div/>
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
