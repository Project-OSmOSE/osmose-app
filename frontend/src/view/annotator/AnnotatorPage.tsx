import React, { Fragment, useEffect } from "react";
import styles from './annotator.module.scss';
import { Footer, Header } from "@/components/layout";
import { IonIcon, IonNote } from "@ionic/react";
import { Annotator } from "@/view/annotator/Annotator.tsx";
import { Link, Progress } from "@/components/ui";
import { helpBuoyOutline } from "ionicons/icons";
import { IoCheckmarkCircleOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useCanNavigate } from "@/service/annotator/hook.ts";
import { useAppSelector } from "@/service/app.ts";
import { AnnotatorAPI } from "@/service/annotator";
import { CampaignAPI } from "@/service/campaign";

export const AnnotatorPage: React.FC = () => {
  const { data: campaign, currentPhase } = CampaignAPI.useRetrieveQuery()
  const { data } = AnnotatorAPI.useRetrieveQuery();

  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);

  const canNavigate = useCanNavigate()

  useEffect(() => {
    if (pointerPosition) { // Disable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    } else { // Enable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'unset';
    }
  }, [ pointerPosition ]);

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
                    appPath={ `/annotation-campaign/${ campaign?.id }/phase/${ currentPhase?.id }` }>
                Back to campaign
              </Link>
            </Fragment> }>
      { data && campaign && <div className={ styles.info }>
          <p>
            { campaign.name } <IoChevronForwardOutline/> { data.file.filename } { data.is_submitted &&
              <IoCheckmarkCircleOutline/> }
          </p>
        { data.is_assigned &&
            <Progress label='Position'
                      className={ styles.progress }
                      value={ data.current_task_index + 1 }
                      total={ data.total_tasks }/> }
        { !data.is_assigned && <IonNote>You are not assigned to annotate this file.</IonNote> }
      </div> }
    </Header>

    <Annotator/>

    <Footer/>
  </div>
}