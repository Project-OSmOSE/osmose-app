import React, { Fragment, useEffect } from "react";
import styles from './annotator.module.scss';
import { Footer, Header } from "@/components/layout";
import { IonButton, IonIcon } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { Annotator } from "@/view/annotator/Annotator.tsx";
import { Link } from "@/components/ui";
import { helpBuoyOutline } from "ionicons/icons";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { IoCheckmarkCircleOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useToast } from "@/service/ui";
import { useRetrieveCampaignQuery } from "@/service/campaign";

export const AnnotatorPage: React.FC = () => {
  const { campaignID, fileID } = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery({ campaignID, fileID });
  const { data: campaign } = useRetrieveCampaignQuery(campaignID)
  const toast = useToast();
  const history = useHistory();

  useEffect(() => {
    return () => {
      toast.dismiss();
    }
  }, [])

  function backToCampaign() {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_self")
  }

  function auxBackToCampaign() {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_blank")
  }

  function backToOldInterface() {
    history.push(`/annotation-campaign/${ campaignID }/file/${ fileID }`);
  }

  return <div className={ styles.page }>
    <Header size='small'
            buttons={ <Fragment>
              <IonButton fill='outline' size='small' color='medium' onClick={ backToOldInterface }>
                Back to old annotator
              </IonButton>

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
      { data && campaign && <p className={ styles.info }>
        { campaign.name } <IoChevronForwardOutline/> { data.file.filename } { data.is_submitted &&
          <IoCheckmarkCircleOutline/> }
      </p> }
    </Header>

    <Annotator/>

    <Footer/>
  </div>
}