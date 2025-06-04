import React, { useMemo } from "react";
import {
  ArticleBibliography,
  Bibliography,
  ConferenceBibliography,
  PosterBibliography,
  SoftwareBibliography
} from "../../models/bibliography";
import styles from "./item.module.scss";
import { Authors } from "./Authors";
import { IoLinkOutline } from "react-icons/io5";

export const BibliographyCard: React.FC<{ reference: Bibliography }> = ({ reference }) => {
  const status = useMemo(() => reference.publication_status === 'Published' ? reference.publication_date : reference.publication_status, [ reference ]);
  const link = useMemo(() => {
    if (reference.doi) return `https://doi.org/${ reference.doi }`
    if (reference.type === 'Poster' && reference.poster_url) return reference.poster_url
    return undefined
  }, [ reference ]);

  const details = useMemo(() => {
    switch (reference.type) {
      case "Article":
        return <ArticleDetail article={ reference }/>
      case "Software":
        return <SoftwareDetail software={ reference }/>
      case "Conference":
      case "Poster":
        return <ConferenceDetail conference={ reference }/>
    }
  }, [ reference ])

  return <a className={ styles.bibliography }
            href={ link }
            target="_blank" rel="noopener noreferrer">
    <p className={ styles.title }>{ reference.title }</p>
    <p className={ styles.details }>
      <Authors authors={ reference.authors }/>, ({ status }). { details }
    </p>
    { reference.tags.length > 0 && <div className={ styles.tags }>
      { reference.tags.map(tag => <p>{ tag }</p>) }
    </div> }

    <div className={ styles.doiLinks }>
      { reference.doi &&
          <a href={ link } className={ styles.doi }
             target="_blank" rel="noopener noreferrer">
              <IoLinkOutline/>
          </a> }
    </div>

    <div className={ styles.type }>{ reference.type }</div>
  </a>
}

export const ArticleDetail: React.FC<{ article: ArticleBibliography }> = ({ article }) => {
  const details = useMemo(() => {
    const d = [];
    d.push(article.journal)
    d.push(article.volumes)
    if (article.pages_from) {
      if (article.pages_to) d.push(`p${ article.pages_from }-${ article.pages_to }`);
      else d.push(`p${ article.pages_from }`);
    }
    if (article.issue_nb) d.push(article.issue_nb)
    if (article.article_nb) d.push(article.article_nb)
    return d;
  }, [ article ])

  return <span>{ details.join(', ') }</span>
}

export const ConferenceDetail: React.FC<{ conference: ConferenceBibliography | PosterBibliography }> = ({ conference }) => (
  <span>
    <a href={ conference.conference_abstract_book_url ?? undefined }
       target="_blank" rel="noopener noreferrer">
    { conference.conference }
  </a>, { conference.conference_location }
  </span>
)

export const SoftwareDetail: React.FC<{ software: SoftwareBibliography }> = ({ software }) => (
  <a href={ software.repository_url ?? undefined }
     target="_blank" rel="noopener noreferrer">
    { software.publication_place }
  </a>
)