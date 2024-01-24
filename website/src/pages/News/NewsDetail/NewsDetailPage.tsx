import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";

import { getFormattedDate, useFetchDetail } from "../../../utils";
import { News } from "../../../models/news";
import { ContactList } from "../../../components/ContactList/ContactList";
import { Back } from "../../../components/Back/Back";
import { DetailPage } from "../../../components/DetailPage/DetailPage";
import { HTMLContent } from '../../../components/HTMLContent/HTMLContent';



export const NewsDetailPage: React.FC = () => {
  const { id: articleID } = useParams<{ id: string; }>();

  let [article, setArticle] = React.useState<News>();

  const fetchDetail = useFetchDetail<News>('/news', '/api/news');

  useEffect(() => {
    let isMounted = true;
    fetchDetail(articleID).then(article => isMounted && setArticle(article));

    return () => {
      isMounted = false;
    }
  }, [articleID, fetchDetail]);

  return (
    <DetailPage>
      <Back path="/news" pageName="News"></Back>

      <div className="head">
        <h1>{ article?.title }</h1>
        <p className="text-muted">{ getFormattedDate(article?.date) }</p>
      </div>

      <ContactList teamMembers={ article?.osmose_member_authors ?? [] }
                   namedMembers={ article?.other_authors ?? [] }></ContactList>

      { article?.body && <HTMLContent content={ article.body }></HTMLContent> }
    </DetailPage>
  );
};
