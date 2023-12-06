import React, { useEffect } from 'react';
import { Link, useParams } from "react-router-dom";

import { API_FETCH_INIT, getFormattedDate } from "../../utils";
import { News } from "../../models/news";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { ContactList } from "../../components/ContactList/ContactList";
import './styles.css'
import { HTMLContent } from "../../components/HTMLContent/HTMLContent";

const NEWS_API_URL = '/api/news';


export const SingleNews: React.FC = () => {
    const urlParams: any = useParams();

    let [article, setArticle] = React.useState<News>();

    useEffect(() => {
        const fetchArticle = async () => {
            const response = await fetch(`${ NEWS_API_URL }/${ urlParams.id }`, API_FETCH_INIT);
            if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
            setArticle(await response.json());
        };
        fetchArticle().catch(error => console.error(`Cannot fetch article, got error: ${ error }`));

    }, [urlParams.id]);

    return (
        <div id="single-news">
            <Link to="/people" className="back">
                <IonIcon icon={ chevronBackOutline }></IonIcon>
                Back to People
            </Link>

            { article && (
                <div id="article">
                    <div className="article-head">
                        <h1>{ article.title }</h1>
                        { article.date && <p className="text-muted">{ getFormattedDate(article.date) }</p> }
                    </div>

                    <HTMLContent content={ article.body }></HTMLContent>

                    <ContactList label="Authors"
                                 teamMembers={ article.osmose_member_authors ?? [] }
                                 namedMembers={ article.other_authors ?? [] }></ContactList>
                </div>
            ) }
        </div>
    )
        ;
};
