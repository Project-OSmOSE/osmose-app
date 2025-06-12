import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import styles from './annotator.module.scss';
import { Footer, Header } from "@/components/layout";
import { IonIcon, IonNote } from "@ionic/react";
import { Annotator } from "@/view/annotator/Annotator.tsx";
import { Link, Progress } from "@/components/ui";
import { helpBuoyOutline } from "ionicons/icons";
import { IoCheckmarkCircleOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useAnnotatorSliceSetup, useCanNavigate } from "@/service/slices/annotator";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { UserAPI } from "@/service/api/user.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";
import { API } from "@/service/api";

export const AnnotatorPage: React.FC = () => {
  UserAPI.endpoints.getCurrentUser.useQuery()
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { data } = useRetrieveAnnotator();
  useAnnotatorSliceSetup()
  const dispatch = useAppDispatch()

  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);
  const isEditable = useMemo(() => !campaign?.archive && !phase?.ended_by && data?.is_assigned, [ campaign, phase, data ])

  const canNavigate = useCanNavigate()

  useEffect(() => {
    if (pointerPosition) { // Disable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    } else { // Enable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'unset';
    }
  }, [ pointerPosition ]);

  const onBack = useCallback(() => {
    dispatch(API.util.invalidateTags([ {
      type: 'CampaignPhase',
      id: phase?.id
    } ]))
  }, [ phase ])

  // 'page' class is for playwright tests
  return <div className={ [ styles.page, 'page' ].join(' ') }>
    <Header size='small'
            canNavigate={ canNavigate }
            buttons={ <Fragment>

              { campaign?.instructions_url &&
                  <Link color='medium' target='_blank' href={ campaign?.instructions_url }>
                      <IonIcon icon={ helpBuoyOutline } slot='start'/>
                      Campaign instructions
                  </Link>
              }

              <Link color='medium' fill='outline' size='small'
                    onClick={ onBack }
                    appPath={ `/annotation-campaign/${ campaign?.id }/phase/${ phase?.id }` }>
                Back to campaign
              </Link>
            </Fragment> }>
      { data && campaign && <div className={ styles.info }>
          <p>
            { campaign.name } <IoChevronForwardOutline/> { data.file.filename } { data.is_submitted &&
              <IoCheckmarkCircleOutline/> }
          </p>
        { isEditable &&
            <Progress label='Position'
                      className={ styles.progress }
                      value={ data.current_task_index + 1 }
                      total={ data.total_tasks }/> }
        { campaign?.archive ? <IonNote>You cannot annotate an archived campaign.</IonNote> :
          phase?.ended_by ? <IonNote>You cannot annotate an ended phase.</IonNote> :
            !data.is_assigned ? <IonNote>You are not assigned to annotate this file.</IonNote> :
              <Fragment/>
        }
      </div> }
    </Header>

    <Annotator/>

    <Footer/>
  </div>
}