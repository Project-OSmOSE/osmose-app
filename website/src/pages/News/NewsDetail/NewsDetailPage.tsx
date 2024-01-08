import React, { useEffect } from 'react';
import { Redirect, useParams } from "react-router-dom";

import { getFormattedDate, parseHTML, useFetchDetail } from "../../../utils";
import { News } from "../../../models/news";
import { ContactList } from "../../../components/ContactList/ContactList";
import { Back } from "../../../components/Back/Back";
import { DetailPage } from "../../../components/DetailPage/DetailPage";
import { TeamMember } from "../../../models/team";
import { HTMLContent } from '../../../components/HTMLContent/HTMLContent';



export const NewsDetailPage: React.FC = () => {
  const { id: articleID } = useParams<{ id: string; }>();

  let [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  let [article, setArticle] = React.useState<News>();

  const fetchDetail = useFetchDetail<News>('/news', '/api/news');

  useEffect(() => {
    fetchDetail(articleID).then(setArticle);
  }, [articleID]);

  return (
    <DetailPage>
      <Back path="/news" pageName="News"></Back>

      <div className="head">
        <h1>{ article?.title }</h1>
        <p className="text-muted">{ getFormattedDate(article?.date) }</p>
      </div>

      <ContactList label="Attendees"
                   teamMembers={ article?.osmose_member_authors ?? [] }
                   namedMembers={ article?.other_authors ?? [] }></ContactList>

      { article?.body && <HTMLContent content={ article.body }></HTMLContent> }
    </DetailPage>
  );
};
