import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface CardMemberTextlessProps {
  img?: string;
  imgAlt?: string;
  name?: string;
  job?: string;
  url?: string;
}

export const CardMemberTextless: React.FC<CardMemberTextlessProps> = ({
  img, // images must be squares
  imgAlt = '',
  name,
  job,
  url,
  }) => {
  return (
  <div className="card cardAncient my-4 border-0">
    <img className="card-img-top align-self-center" src={img} alt={imgAlt} title={imgAlt} />

    <div className="card-body text-center">
      {name ? <h5 className="card-title">{name}</h5> : null}
      {job ? <p className="card-text">
        <small className="text-muted">{job}</small>
      </p> : null}
      {url ? <p className="card-text">
        <Link className="card-link" to={url}>Page personnelle</Link>
      </p> : null}
    </div>
  </div>
  );
}
