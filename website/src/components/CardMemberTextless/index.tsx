import React from 'react';

import './styles.css';

import defaultPortrait from '../../img/people/default_profil.png';

export interface CardMemberTextlessProps {
  img?: string;
  imgAlt?: string;
  name?: string;
  job?: string;
  link?: string;
  linkDesc?: string;
}

export const CardMemberTextless: React.FC<CardMemberTextlessProps> = ({
  img = '', // images must be squares
  imgAlt = '',
  name = '',
  job = '',
  link = '',
  linkDesc = 'Personal page'
}) => {

  return (
    <div className="card cardAncient my-4 border-0">
      {img 
        ? <img className="card-img-top align-self-center" src={img} alt={imgAlt} title={imgAlt} /> 
        : <img className="card-img-top align-self-center" src={defaultPortrait} alt={imgAlt} title={imgAlt} />
      }
      <div className="card-body text-center">
        {name ? <h5 className="card-title">{name}</h5> : null}
        {job ? <p className="card-text"> <small className="text-muted">{job}</small> </p> : null}
        {link ? <p className="card-text"> <a className="card-link" href={link} target="_blank" rel="noreferrer">{linkDesc}</a> </p> : null}
      </div>
    </div>
  );
}
