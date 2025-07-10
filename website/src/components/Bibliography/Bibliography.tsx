import React, { Fragment, useCallback, useMemo } from "react";
import {
  ArticleInformation,
  Bibliography,
  ConferenceInformation,
  SoftwareInformation
} from "../../models/bibliography";
import styles from "./item.module.scss";
import { Authors } from "./Authors";
import { IoLinkOutline } from "react-icons/io5";

export const BibliographyCard: React.FC<{ reference: Bibliography }> = ({ reference }) => {
  const status = useMemo(() => reference.status === 'Published' ? reference.publication_date : reference.status, [ reference ]);
  const link = useMemo(() => {
    if (reference.doi) return `https://doi.org/${ reference.doi }`
    if (reference.type === 'Poster' && reference.poster_information.poster_url) return reference.poster_information.poster_url
    return undefined
  }, [ reference ]);

  const details = useMemo(() => {
    switch (reference.type) {
      case "Article":
        return <ArticleDetail info={ reference.article_information }/>
      case "Software":
        return <SoftwareDetail info={ reference.software_information }/>
      case "Conference":
      case "Poster":
        if (!reference.conference_information) return <Fragment/>;
        return <ConferenceDetail info={ reference.conference_information }/>
    }
  }, [ reference ])

  const openLink = useCallback(() => {
    if (!link) return;
    window.open(link, "_blank", "noopener noreferrer");
  }, [ link ])

  return <div className={ [ styles.bibliography, link && styles.clickable ].join(' ') }
              onClick={ openLink }>
    <p className={ styles.title }>{ reference.title }</p>
    <p className={ styles.details }>
      <Authors authors={ reference.authors }/>, ({ status }). { details }
    </p>
    { reference.tags.length > 0 && <div className={ styles.tags }>
      { reference.tags.map(tag => <p key={ tag }>{ tag }</p>) }
    </div> }

    <div className={ styles.doiLinks }>
      { reference.doi &&
          <a href={ link } className={ styles.doi }
             target="_blank" rel="noopener noreferrer">
              <IoLinkOutline/>
          </a> }
    </div>

    <div className={ styles.type }>{ reference.type }</div>
  </div>
}

export const ArticleDetail: React.FC<{ info: ArticleInformation }> = ({ info }) => {
  const details = useMemo(() => {
    const d = [];
    d.push(info.journal)
    d.push(info.volumes)
    if (info.pages_from) {
      if (info.pages_to) d.push(`p${ info.pages_from }-${ info.pages_to }`);
      else d.push(`p${ info.pages_from }`);
    }
    if (info.issue_nb) d.push(info.issue_nb)
    if (info.article_nb) d.push(info.article_nb)
    return d;
  }, [ info ])

  return <span>{ details.join(', ') }</span>
}

export const ConferenceDetail: React.FC<{ info: ConferenceInformation }> = ({ info }) => (
  <span>
    <a href={ info.conference_abstract_book_url ?? undefined }
       target="_blank" rel="noopener noreferrer">
    { info.conference }
  </a>, { info.conference_location }
  </span>
)

export const SoftwareDetail: React.FC<{ info: SoftwareInformation }> = ({ info }) => (
  <a href={ info.repository_url ?? undefined }
     target="_blank" rel="noopener noreferrer">
    { info.publication_place }
  </a>
)