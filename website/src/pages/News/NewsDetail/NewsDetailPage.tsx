import React, { useEffect } from 'react';
import { Redirect, useParams } from "react-router-dom";

import { API_FETCH_INIT, getFormattedDate, parseHTML } from "../../../utils";
import { News } from "../../../models/news";
import { ContactList } from "../../../components/ContactList/ContactList";
import { Back } from "../../../components/Back/Back";
import { DetailPage } from "../../../components/DetailPage/DetailPage";

const NEWS_API_URL = '/api/news';


export const NewsDetailPage: React.FC = () => {
  const urlParams: any = useParams();

  let [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  let [article, setArticle] = React.useState<News>();


  useEffect(() => {
    const fetchDetail = async () => {
      const response = await fetch(`${ NEWS_API_URL }/${ urlParams.id }`, API_FETCH_INIT);
      if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
      setArticle(await response.json());
    };
    fetchDetail()
      .catch(error => console.error(`Cannot fetch news detail, got error: ${ error }`))
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
        { article.date && <p className="text-muted">{ getFormattedDate(article.date) }</p> }
      </div>

      <ContactList label="Attendees"
                   teamMembers={ article.osmose_member_authors ?? [] }
                   namedMembers={ article.other_authors ?? [] }></ContactList>

      <div className="body">{ parseHTML(article.body) }</div>

    </DetailPage>
  );
};
