import React, { Fragment, useEffect } from "react";
import styles from './annotator.module.scss';
import { Footer, Header } from "@/components/layout";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { Annotator } from "@/view/annotator/Annotator.tsx";
import { Link, Progress } from "@/components/ui";
import { helpBuoyOutline } from "ionicons/icons";
import { IoCheckmarkCircleOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useCanNavigate } from "@/service/annotator/hook.ts";
import { useAppSelector } from "@/service/app.ts";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { usePageCampaign } from "@/service/routing";

export const AnnotatorPage: React.FC = () => {
  const campaign = usePageCampaign()
  const { data } = useRetrieveAnnotatorQuery();

  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);

  const canNavigate = useCanNavigate()

  async function backToCampaign() {
    if (await canNavigate())
      window.open(`/app/annotation-campaign/${ campaign?.id }`, "_self")
  }

  function auxBackToCampaign() {
    window.open(`/app/annotation-campaign/${ campaign?.id }`, "_blank")
  }

  useEffect(() => {
    if (pointerPosition) { // Disable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    } else { // Enable scroll
      document.getElementsByTagName('html')[0].style.overflowY = 'unset';
    }
  }, [pointerPosition]);

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

              <IonButton color='medium' fill='outline' size='small'
                         onClick={ backToCampaign } onAuxClick={ auxBackToCampaign }>
                Back to campaign
              </IonButton>
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