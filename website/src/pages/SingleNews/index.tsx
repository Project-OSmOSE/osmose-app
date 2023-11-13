import React from 'react';
import { useParams } from "react-router-dom";
import {Parser} from "html-to-react";

import {CardArticle} from "../../components/CardArticle";

const NEWS_API_URL = '/api/news/';
interface SingleNewsProps {
  id?: string,
  title?: string,
  vignette?: string,
  intro?: string,
  date?: string,
  body?: string
};

export const SingleNews: React.FC = () => {
  const urlParams: any = useParams();
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
          }
        };
        try {
          const resp = await fetch(NEWS_API_URL+urlParams.id, init);
          if (resp.ok){
            tempArticle = await resp.json();
            setArticle(tempArticle);
          }
          else{
            throw new Error(resp.status + " " + resp.statusText);
          }
        } catch (err) {
          console.error('An error occured during data fetching');
          console.error(err);
        }
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
