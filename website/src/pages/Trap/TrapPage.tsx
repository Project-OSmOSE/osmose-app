import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { SiLinkedin, SiMaildotru, SiResearchgate } from "react-icons/si";
import { getFormattedDate, useFetchArray } from "../../utils";
import { PageTitle } from "../../components/PageTitle";
import { Pagination } from "../../components/Pagination/Pagination";
import { Trap } from "../../models/trap";
import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
import styles from './TrapPage.module.scss';

export const TrapPage: React.FC = () => {
  const pageSize = 6;// Define page size for pagination
  const location = useLocation(); // Get the current URL location
  const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);// Get the current page number from URL parameters
  const [trapTotal, setTrapTotal] = useState<number>(0); // State to hold the total number of traps
  const [trap, setTrap] = useState<Array<Trap>>([]); // State to hold the list of traps
  const fetchTrap = useFetchArray<{ count: number, results: Array<Trap> }>('/api/trap'); // Function to fetch trap data

  useEffect(() => {
    let isMounted = true;
    fetchTrap({ currentPage, pageSize }).then(data => {
      if (isMounted) {
        setTrapTotal(data?.count ?? 0);
        setTrap(data?.results ?? []);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize]); // Effect dependencies: currentPage and pagesize

  return (
    <div>
      <PageTitle img={ imgTitle } imgAlt="Trap Banner">
        Table Ronde Acoustique Passive
      </PageTitle>

      <div className={ styles.content }>
        { trap.map(data => (
          <IonCard key={ data.id } className={ styles.card }>
            { data.thumbnail && <img src={ data.thumbnail } alt={ data.title }/> }

            <IonCardHeader>
              <IonCardTitle>{ data.title }</IonCardTitle>
              <IonCardSubtitle>{ getFormattedDate(data.date) }</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>{ data.intro }</IonCardContent>

            <IonCardHeader className={ styles.presenterInfo }>
              <IonCardSubtitle className={ styles.presenter }>
                { data.presenter_firstname } { data.presenter_lastname }
              </IonCardSubtitle>
              <IonCardSubtitle className={ styles.cardLinks }>
                { data.presenter_research_gate_url && (  // Display Research gate link if available
                  <a href={ data.presenter_research_gate_url } target="_blank" rel="noreferrer">
                    <SiResearchgate/></a>
                ) }
                { data.presenter_mail_address && (  // Display Mail link if available
                  <a href={ `mailto:${ data.presenter_mail_address }` } target="_blank" rel="noreferrer">
                    <SiMaildotru/>
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

      <Pagination totalCount={ trapTotal }
                  currentPage={ currentPage }
                  pageSize={ pageSize }
                  path="/trap"/>
    </div>
  );
};
