import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

import { PageTitle } from "../../components/PageTitle";
import { Pagination } from "../../components/Pagination/Pagination";

import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
import { API_FETCH_INIT, getFormattedDate } from "../../utils";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { News } from "../../models/news";

import './NewsPage.css';

const NEWS_URL = '/api/news';


export const NewsPage: React.FC = () => {
  const pageSize = 6;
  const location = useLocation();
  const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);

  const [newsTotal, setNewsTotal] = useState<number>(0);
  const [news, setNews] = useState<Array<News>>([]);
  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch(`${ NEWS_URL }?page=${ currentPage }&page_size=${ pageSize }`, API_FETCH_INIT);
      if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
      const data = await response.json();
      setNewsTotal(data.count);
      setNews(data.results);
    };
    fetchNews().catch(error => console.error(`Cannot fetch news, got error: ${ error }`));
  }, [currentPage]);

  return (
    <div id="news-page">
      <PageTitle img={ imgTitle } imgAlt="News Banner">
        NEWS
      </PageTitle>

      <div className="content">
        { news.map(data => (
          <IonCard key={ data.id } href={ `/news/${ data.id }` }>
            { data.thumbnail && <img src={ data.thumbnail } alt={ data.title }/> }

            <IonCardHeader>
              <IonCardTitle>{ data.title }</IonCardTitle>
              { data.date &&
                  <IonCardSubtitle>{ getFormattedDate(data.date) }</IonCardSubtitle> }
            </IonCardHeader>

            <IonCardContent>{ data.intro }</IonCardContent>
          </IonCard>
        )) }
      </div>

      <Pagination totalCount={ newsTotal }
                  currentPage={ currentPage }
                  pageSize={ pageSize }
                  path="/news"/>
    </div>
  );
};
