import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IonButton, IonIcon } from "@ionic/react";
import { caretBack, caretForward } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { useToast } from "@/service/ui";
import { Kbd, TooltipOverlay } from "@/components/ui";
import styles from '../annotator-tools.module.scss'
import { KEY_DOWN_EVENT, useEvent } from "@/service/events";
import { useCanNavigate } from "@/service/slices/annotator";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { usePostAnnotator, useRetrieveAnnotator } from "@/service/api/annotator.ts";
import { useOpenAnnotator } from "@/service/annotator/hooks.ts";


export const NavigationButtons: React.FC = () => {
  const { data, isEditable } = useRetrieveAnnotator();
  const { campaignID } = useRetrieveCurrentCampaign()
  const { phaseID } = useRetrieveCurrentPhase()
  const openAnnotator = useOpenAnnotator()

  // Services
  const navigate = useNavigate();
  const post = usePostAnnotator();
  const toast = useToast();

  // Data
  const {
    didSeeAllFile: _didSeeAllFile,
  } = useAppSelector(state => state.annotator);

  const previous_file_id = useRef<number | null>(data?.previous_file_id ?? null);
  useEffect(() => {
    previous_file_id.current = data?.previous_file_id ?? null;
  }, [ data?.previous_file_id ]);
  const next_file_id = useRef<number | null>(data?.next_file_id ?? null);
  useEffect(() => {
    next_file_id.current = data?.next_file_id ?? null;
  }, [ data?.next_file_id ]);
  const didSeeAllFile = useRef<boolean>(_didSeeAllFile);
  useEffect(() => {
    didSeeAllFile.current = _didSeeAllFile;
  }, [ _didSeeAllFile ]);

  const isSubmitting = useRef<boolean>(false);

  const canNavigate = useCanNavigate()

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

  useEvent(KEY_DOWN_EVENT, onKbdEvent);

  const submit = async () => {
    if (!didSeeAllFile.current) {
      const force = await toast.presentError('Be careful, you haven\' see all of the file yet. Try scrolling to the end or changing the zoom level', true, 'Force');
      if (!force) return;
    }
    isSubmitting.current = true;
    try {
      await post()
      if (next_file_id.current) {
        openAnnotator(next_file_id.current);
      } else {
        navigate(`/annotation-campaign/${ campaignID }/phase/${ phaseID }`)
      }
    } catch (e: any) {
      toast.presentError(e)
    } finally {
      isSubmitting.current = false;
    }
  }

  const navPrevious = async () => {
    if (!previous_file_id.current) return;
    if (await canNavigate()) openAnnotator(previous_file_id.current)
  }
  const navNext = async () => {
    if (!next_file_id.current) return;
    if (await canNavigate()) openAnnotator(next_file_id.current)
  }

  if (!isEditable) return <div/>
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
