import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { PageTitle } from "../../components/PageTitle";
import { Pagination } from "../../components/Pagination/Pagination";
import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
import { getFormattedDate, useFetchArray } from "../../utils";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon } from "@ionic/react";
import { mailOutline, logoLinkedin } from "ionicons/icons";
import { Trap } from "../../models/trap";
import './TrapPage.css';

export const TrapPage: React.FC = () => {
    const pageSize = 6;
    const location = useLocation();
    const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);
    const [trapTotal, setTrapTotal] = useState<number>(0);
    const [trap, setTrap] = useState<Array<Trap>>([]);
    const fetchTrap = useFetchArray<{ count: number, results: Array<Trap> }>('/api/trap');

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
    }, [currentPage, pageSize]);// Effect dependencies: current page number and page size


    return (
        <div id="trap-page">
            <PageTitle img={ imgTitle } imgAlt="Trap Banner">
              Table Ronde Acoustique Passive
            </PageTitle>

            <div className="content">
                { trap.map(data => (
                    <IonCard key={ data.id }>
                        { data.thumbnail && <img src={ data.thumbnail } alt={ data.title } className="card-image" /> }

                        <IonCardHeader>
                            <IonCardTitle>{ data.title }</IonCardTitle>
                            <IonCardSubtitle>{ getFormattedDate(data.date) }</IonCardSubtitle>
                            <div className="social-links">
                                { data.research_gate_url && (
                                    <a href={data.research_gate_url} target="_blank" rel="noreferrer">
                                        ResearchGate
                                    </a>
                                )}
                                { data.mail_address && (
                                    <a href={`mailto:${data.mail_address}`} target="_blank" rel="noreferrer">
                                        <IonIcon icon={mailOutline} /> Mail
                                    </a>
                                )}
                                { data.linkedin_url && (
                                    <a href={data.linkedin_url} target="_blank" rel="noreferrer">
                                        <IonIcon icon={logoLinkedin} /> LinkedIn
                                    </a>
                                )}
                            </div>
                        </IonCardHeader>
                        <IonCardContent>
                            { data.intro }
                        </IonCardContent>
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
