import React from 'react';
import { useParams } from "react-router-dom";

import {PageTitle} from "../../components/PageTitle";
import {ShortCardArticle} from "../../components/ShortCardArticle";
import {Pagination} from "../../components/Pagination";

import imgTitle from '../../img/illust/pexels-berend-de-kort-1452701_1920_thin.webp';
// import articles_data from '../../articles_data2.js'; 

const NEWS_URL = '/api/news/';


function generateContent(tempNews: Array<any>) {
  const content = tempNews.map((art) => {
    // art.id = art?.id ?? 0;
    return (
      <ShortCardArticle
        id={String(art?.id)}
        title={art?.title}
        vignette={art?.vignette}
        intro={art?.intro}
        date={art?.date}
        key={String(art?.id)}
      >
        {art?.intro}
      </ShortCardArticle>
    );
  });

    return content;
}

export const News: React.FC = () => {
  const pageSize = 5;
  const urlParams: any = useParams();
  const currentPage = Number(urlParams.page);
  const articleStart = ((currentPage-1)*5);
  let tempNews: any[] = [];
  let totalArticleNb: number = 0;
  const [news, setNews] = React.useState(tempNews);
  let content;
  React.useEffect(
    () => {
      const fetchNews = async () => {
        const init = {	
          method: 'GET',
          headers: { 
              'Accept': 'application/json',
          }
        };
        try {
          const resp = await fetch(NEWS_URL, init);
          if (resp.ok){
            tempNews = await resp.json();
            setNews(tempNews);
          }
          else{
            throw new Error(resp.status + " " + resp.statusText);
          }
        } catch (err) {
          console.error('An error occured during data fetching');
          console.error(err);
        }
      };
      fetchNews();
    },
    []
  );
  if (news?.length){
    totalArticleNb = news.length;
    content = generateContent(news.slice(articleStart, articleStart+pageSize));
  } else {
    content = "";
  }

  return (
    <div id="news-page">
      <PageTitle img={imgTitle} imgAlt="News Banner">
        <h1 className="align-self-center">
          NEWS
        </h1>
      </PageTitle>

      <div className="container">
        {content}

        <Pagination
          totalCount={totalArticleNb}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};
