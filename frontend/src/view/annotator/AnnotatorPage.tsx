import React, { Fragment, useEffect } from "react";
import styles from './annotator.module.scss';
import { Footer, Header } from "@/components/layout";
import { IonButton, IonIcon } from "@ionic/react";
import { useParams } from "react-router-dom";
import { Annotator } from "@/view/annotator/Annotator.tsx";
import { Link } from "@/components/ui";
import { helpBuoyOutline } from "ionicons/icons";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { IoChevronForwardOutline } from "react-icons/io5";
import { useBlur } from "@/services/utils/clic.ts";
import { useToast } from "@/services/utils/toast.ts";

export const AnnotatorPage: React.FC = () => {
  const { campaignID, fileID } = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery({ campaignID, fileID });
  const blurUtil = useBlur();
  const toast = useToast();

  useEffect(() => {
    document.addEventListener('click', blurUtil.onClick)
    return () => {
      document.removeEventListener('click', blurUtil.onClick);
      blurUtil.cleanListener();
      toast.dismiss();
    }
  }, [])

  function backToCampaign() {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_self")
  }

  function auxBackToCampaign() {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_blank")
  }

  return <div className={ styles.page }>
    <Header size='small'
            buttons={ <Fragment>
              { data?.campaign.instructions_url &&
                  <Link color='medium' target='_blank' href={ data?.campaign.instructions_url }>
                      <IonIcon icon={ helpBuoyOutline } slot='start'/>
                      Campaign instructions
                  </Link>
              }

              <IonButton color='medium' fill='outline' size='small'
                         onClick={ backToCampaign } onAuxClick={ auxBackToCampaign }>
                Back to campaign
              </IonButton>
            </Fragment> }>
      { data && <p className={ styles.info }>{ data.campaign.name } <IoChevronForwardOutline/> { data.file.filename }</p> }
    </Header>

    <Annotator/>

    <Footer/>
  </div>
}