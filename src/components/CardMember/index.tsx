import React from 'react';
// import { Link } from 'react-router-dom';

import './styles.css';

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
  urlDesc,
  children
}) => {

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
          {url && urlDesc ? <p className="card-text">
            <a className="card-link" href={url}>{urlDesc}</a>
          </p> : null}
        </div>
      </div>

      {img && imgSide === 'left' ? <div className="col-md-4 d-flex align-items-center justify-content-center order-md-0">
        <img className="card-img" src={img} alt={imgAlt} title={imgAlt} />
      </div> : null}

      {img && imgSide === 'right' ? <div className="col-md-4 d-flex align-items-center justify-content-center order-md-2">
        <img className="card-img" src={img} alt={imgAlt} title={imgAlt} />
      </div> : null}

    </div>
  </div>
  );
}
