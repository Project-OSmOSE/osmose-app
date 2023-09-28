import React from 'react';
import { useParams } from "react-router-dom";
import {Parser} from "html-to-react";

import {CardArticle} from "../../components/CardArticle";

import articles_data from '../../articles_data2.js'; // TO REMOVE

const NEWS_API_URL = '/api/news/';


export const SingleNews: React.FC = () => {
  const urlParams: any = useParams();

  interface SingleNewsProps {
    id?: string,
    title?: string,
    vignette?: string,
    intro?: string,
    date?: string,
    body?: string
  };
  let tempArticle: SingleNewsProps = { 
    id: "",
    title: "",
    vignette: "",
    intro: "",
    date: "",
    body: ""
  };

  let [article, setArticle] = React.useState(tempArticle);

  React.useEffect(
    () => {
      const fetchArticle = async () => {
        const init = {	
          method: 'GET',
          headers: { 
              'Accept': 'application/json',
              // 'Referer': 'origin'
          }
        };
        try {
          const resp = await fetch(NEWS_API_URL+urlParams.id, init);
          console.log("response", resp);
          // tempArticle = await resp.json();
          tempArticle = articles_data.find((art) => art['id'] == urlParams.id) ?? tempArticle;
        } catch (err) {
          console.error('An error occured during data fetching');
          console.error(err);
        }
        console.log("tempArticle : ", tempArticle);
        setArticle(tempArticle);
      };
      fetchArticle();
    },
    []
  );

  return (
    <div id="singleNews">
      <div className="container">
        <CardArticle
          id={String(article?.id)}
          title={article?.title}
          vignette={article?.vignette}
          intro={article?.intro}
          date={article?.date}
        >
          {Parser().parse(article?.body ?? "")}
        </CardArticle>
      </div>
    </div>
  );
};
