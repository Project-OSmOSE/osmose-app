import { useParams } from "react-router-dom";
import {Parser} from "html-to-react";

import {PageTitle} from "../../components/PageTitle";
import {CardArticle} from "../../components/CardArticle";

import imgPublications from '../../img/illust/pexels-element-digital-1370295.jpg';
import articles_data from '../../articles_data.js'; 

export const SingleNews: React.FC = () => {
  const urlParams: any = useParams();
  const article = articles_data.articles.find((art) => art['id'] === Number(urlParams.id));

  return (
    <div id="singleNews">
      <PageTitle img={imgPublications} imgAlt="News Banner">
        <h1 className="align-self-center">
          News
        </h1>
      </PageTitle>

      <div className="container">
        <CardArticle
          title={article ? article.title : "Article not found"}
          // img=""
          // imgAlt=""
          stringDate={article ? article.date : ""}
        >
          {Parser().parse(article ? article.content : "")}
        </CardArticle>
      </div>
    </div>
  );
};
