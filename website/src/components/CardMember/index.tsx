import React from 'react';

import './styles.css';
import defaultPortrait from '../../img/people/default_profil.png';

export interface CardMemberProps {
img?: string;
imgSide?: 'left' | 'right';
imgAlt?: string;
name?: string;
job?: string;
url?: string;
urlDesc?: string;
}

export const CardMember: React.FC<CardMemberProps> = ({
  img, // images must be squares
  imgSide = '',
  imgAlt = '',
  name,
  job,
  url,
  urlDesc = 'Personal page',
  children
}) => {
  let classSide = 'order-md-0';
  if (imgSide === 'right')
    classSide = 'order-md-2';

  return (
  <div className="card cardMember my-5 border-0">
    <div className="row no-gutters">

      <div className="col-md-8 order-md-1">
        <div className="card-body">
          {name ? <h5 className="card-title">{name}</h5> : null}
          {job ? <p className="card-text">
            <small className="text-muted">{job}</small>
          </p> : null}
          <div className="card-text">{children}</div>
          {url ? <p className="card-text">
            <a className="card-link" href={url} target="_blank" rel="noreferrer">{urlDesc}</a>
          </p> : null}
        </div>
      </div>

      {img 
        ? <div className={"col-md-4 d-flex align-items-center justify-content-center "+classSide}> <img className="card-img" src={img} alt={imgAlt} title={imgAlt} /> </div> 
        : <div className={"col-md-4 d-flex align-items-center justify-content-center "+classSide}> <img className="card-img" src={defaultPortrait} alt={imgAlt} title={imgAlt} /> </div>
      }

    </div>
  </div>
  );
}
