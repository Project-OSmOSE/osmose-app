import React, { useEffect } from 'react';
import { Redirect, useParams } from "react-router-dom";

import { fetchPage, getFormattedDate, parseHTML, useCatch404 } from "../../../utils";
import { News } from "../../../models/news";
import { ContactList } from "../../../components/ContactList/ContactList";
import { Back } from "../../../components/Back/Back";
import { DetailPage } from "../../../components/DetailPage/DetailPage";
import { HTMLContent } from "../../../components/HTMLContent/HTMLContent";

const NEWS_API_URL = '/api/news';


export const NewsDetailPage: React.FC = () => {
  const urlParams: any = useParams();

  let [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  let [article, setArticle] = React.useState<News>();

  const catch404= useCatch404();

  useEffect(() => {
    fetchPage(`${ NEWS_API_URL }/${ urlParams.id }`)
      .then(setArticle)
      .finally(() => setIsLoaded(true));
  }, [urlParams.id]);

  if (!article) {
    if (isLoaded) return (<Redirect to="/news"></Redirect>);
    return (
      <DetailPage>
        <Back path="/news" pageName="News"></Back>
      </DetailPage>
    );
  }

  return (
    <DetailPage>
      <Back path="/news" pageName="News"></Back>

      <div className="head">
        <h1>{ article.title }</h1>
        <p className="text-muted">{ getFormattedDate(article.date) }</p>
      </div>

      <ContactList label="Attendees"
                   teamMembers={ article.osmose_member_authors ?? [] }
                   namedMembers={ article.other_authors ?? [] }></ContactList>

      <HTMLContent content={ article.body }></HTMLContent>
    </DetailPage>
  );
};
