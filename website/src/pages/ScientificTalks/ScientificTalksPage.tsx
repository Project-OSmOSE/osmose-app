import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { SiLinkedin, SiResearchgate } from "react-icons/si";
import { IoMailOutline } from "react-icons/io5";
import { getFormattedDate, useFetchArray } from "../../utils";
import { PageTitle } from "../../components/PageTitle";
import { Pagination } from "../../components/Pagination/Pagination";
import { ScientificTalk } from "../../models/scientificTalk";
import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
import styles from './ScientificTalksPage.module.scss';

export const ScientificTalksPage: React.FC = () => {
  const pageSize = 6;// Define page size for pagination
  const location = useLocation(); // Get the current URL location
  const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);// Get the current page number from URL parameters
  const [ talksTotal, setTalksTotal ] = useState<number>(0); // State to hold the total number of talks
  const [ talks, setTalks ] = useState<Array<ScientificTalk>>([]); // State to hold the list of talks
  const fetchTalks = useFetchArray<{ count: number, results: Array<ScientificTalk> }>('/api/scientific-talk'); // Function to fetch talks data

  useEffect(() => {
    let isMounted = true;
    fetchTalks({currentPage, pageSize}).then(data => {
      if (isMounted) {
        setTalksTotal(data?.count ?? 0);
        setTalks(data?.results ?? []);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [ currentPage, pageSize ]); // Effect dependencies: currentPage and pagesize

  return (
      <div>
        <PageTitle img={ imgTitle } imgAlt="Scientific talks Banner">
          Scientific talks
        </PageTitle>

        <div className={ styles.content }>

          <p className={ styles.presentation }>
            Our team organises scientific talks on a three-week cycle, providing a platform for sharing and
            disseminating knowledge. Team members present their latest project results and research developments.
            These sessions occasionally feature guest speakers, who bring fresh perspectives and expertise from their
            respective fields.
          </p>

          { talks.map(data => (
              <IonCard key={ data.id } className={ styles.card }>
                { data.thumbnail && <img src={ data.thumbnail } alt={ data.title }/> }

                <IonCardHeader>
                  <IonCardTitle>{ data.title }</IonCardTitle>
                  <IonCardSubtitle>{ getFormattedDate(data.date) }</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>{ data.intro }</IonCardContent>

                <IonCardHeader className={ styles.presenterInfo }>
                  <IonCardSubtitle className={ styles.presenter }>
                    { data.presenter_name }
                  </IonCardSubtitle>
                  <IonCardSubtitle className={ styles.cardLinks }>
                    { data.presenter_research_gate_url && (  // Display Research gate link if available
                        <a href={ data.presenter_research_gate_url } target="_blank" rel="noreferrer">
                          <SiResearchgate/></a>
                    ) }
                    { data.presenter_mail_address && (  // Display Mail link if available
                        <a href={ `mailto:${ data.presenter_mail_address }` } target="_blank" rel="noreferrer">
                          <IoMailOutline/>
                        </a>
                    ) }
                    { data.presenter_linkedin_url && (  // Display LinkedIn link if available
                        <a href={ data.presenter_linkedin_url } target="_blank" rel="noreferrer">
                          <SiLinkedin/>
                        </a>
                    ) }
                  </IonCardSubtitle>
                </IonCardHeader>
              </IonCard>
          )) }
        </div>

        <Pagination totalCount={ talksTotal }
                    currentPage={ currentPage }
                    pageSize={ pageSize }
                    path="/scientific-talks"/>
      </div>
  );
};