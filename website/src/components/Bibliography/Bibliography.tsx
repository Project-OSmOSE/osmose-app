import React, { useMemo } from "react";
import { Bibliography } from "../../models/bibliography";
import styles from "./item.module.scss";
import { Authors } from "./Authors";
import { IoLinkOutline } from "react-icons/io5";

export const BibliographyCard: React.FC<{ reference: Bibliography }> = ({ reference }) => {
  const status = useMemo(() => reference.publication_status === 'Published' ? reference.publication_date : reference.publication_status, [ reference ]);
  const link = useMemo(() => reference.doi ? `https://doi.org/${ reference.doi }` : undefined, [ reference ]);

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
        break;
    }
    return d;
  }, [ reference ])

  return <a className={ styles.bibliography }
            href={ link }
            target="_blank" rel="noopener noreferrer">
    <p className={ styles.title }>{ reference.title }</p>
    <p className={ styles.details }>
      <Authors authors={ reference.authors }/>, ({ status }). { details.join(', ') } { reference.type === 'Software' &&
        <a href={ reference.repository_url ?? undefined }
           target="_blank" rel="noopener noreferrer">
          { reference.publication_place }
        </a> }
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