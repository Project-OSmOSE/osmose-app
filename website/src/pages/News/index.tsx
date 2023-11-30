import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

import { PageTitle } from "../../components/PageTitle";
import { Pagination } from "../../components/Pagination";

import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
import { API_FETCH_INIT } from "../../utils";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { News } from "../../models/news";

import './styles.css';

const NEWS_URL = '/api/news/';


export const NewsPage: React.FC = () => {
    const pageSize = 5;
    const urlParams: any = useParams();
    const currentPage = Number(urlParams.page);
    let totalArticleNb: number = 0;
    const [news, setNews] = useState<Array<News>>([]);
    useEffect(
        () => {
            // TODO: make pagination a server side behavior
            const fetchNews = async () => {
                const response = await fetch(NEWS_URL, API_FETCH_INIT);
                if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
                setNews(await response.json());
            };
            fetchNews().catch(error => console.error(`Cannot fetch news, got error: ${ error }`));
        },
        []
    );
    if (news?.length) totalArticleNb = news.length;

    const getFormattedDate = (date: Date) => {
        return Intl.DateTimeFormat('en-US', {
            dateStyle: 'long'
        }).format(date).replaceAll('/', '-');
    }

    return (
        <div id="news-page">
            <PageTitle img={ imgTitle } imgAlt="News Banner">
                <h1 className="align-self-center">
                    NEWS
                </h1>
            </PageTitle>

            <div className="content">
                { news.map(data => (
                    <IonCard key={ data.id } href={ `/article/${ data.id }` }>
                        { data.vignette && <img src={ data.vignette } alt={ data.title }/> }

                        <IonCardHeader>
                            <IonCardTitle>{ data.title }</IonCardTitle>
                            { data.date &&
                                <IonCardSubtitle>{ getFormattedDate(new Date(data.date)) }</IonCardSubtitle> }
                        </IonCardHeader>

                        <IonCardContent>{ data.intro }</IonCardContent>
                    </IonCard>
                )) }
            </div>

            <Pagination totalCount={ totalArticleNb }
                        currentPage={ currentPage }
                        pageSize={ pageSize }
                        path="/news"/>
        </div>
    );
};
