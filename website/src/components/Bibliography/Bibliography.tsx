import React, { useMemo } from "react";
import { Bibliography } from "../../models/bibliography";
import styles from "./item.module.scss";
import { Authors } from "./Authors";
import { IoLinkOutline } from "react-icons/io5";
import { SiGithub } from "react-icons/si";

export const BibliographyCard: React.FC<{ reference: Bibliography }> = ({ reference }) => {
  const status = useMemo(() => reference.publication_status === 'Published' ? reference.publication_date : reference.publication_status, [ reference ]);
  const link = useMemo(() => `https://doi.org/${ reference.doi }`, [ reference ]);
  const hasSecondLink = useMemo(() => {
    if (reference.type !== 'Software') return false;
    return !!reference.repository_url
  }, [ reference ])

  const details = useMemo(() => {
    const d = [];
    switch (reference.type) {
      case "Article":
        d.push(reference.journal)
        d.push(reference.volumes)
        if (reference.pages_from) {
          if (reference.pages_to) d.push(`p${ reference.pages_from }-${ reference.pages_to }`);
          else d.push(`p${ reference.pages_from }`);
        }
        if (reference.issue_nb) d.push(reference.issue_nb)
        if (reference.article_nb) d.push(reference.article_nb)
        break;
      case "Conference":
        d.push(reference.conference)
        d.push(reference.conference_location)
        break;
      case "Software":
        d.push(reference.publication_place)
        break;
    }
    return d;
  }, [ reference ])

  return <div className={ styles.bibliography }>
    <p className={ styles.title }>{ reference.title }</p>
    <p className={ styles.details }>
      <Authors authors={ reference.authors }/>, ({ status }). { details.join(', ') }
    </p>
    { reference.tags.length > 0 && <div className={ styles.tags }>
      { reference.tags.map(tag => <p>{ tag }</p>) }
    </div> }

    <div className={ [ styles.doiLinks, (reference.doi || hasSecondLink) ? 'exists' : '' ].join(' ') }>
      { reference.type === 'Software' && reference.repository_url && <a href={ reference.repository_url }
                                                                        target="_blank" rel="noopener noreferrer">
          <SiGithub/>
      </a> }
      <a href={ link } className={ styles.doi }
         target="_blank" rel="noopener noreferrer">
        <IoLinkOutline/>
      </a>
    </div>
  </div>
}