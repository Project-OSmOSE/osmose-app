import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface CardProps {
  title?: string;
  img?: string;
  imgSide?: 'left' | 'right';
  imgAlt?: string;
  detailsText?: string;
  detailsUrl?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  img,
  imgSide = 'left',
  imgAlt = '',
  detailsText,
  detailsUrl,
  children
}) => {
  return (
    <div className="card">
      {title ? <h3 className="card-header">{title}</h3> : null }
      <div className="card-main">
        <div className="card-img">
          {img && imgSide === 'left' ? <img src={img} alt={imgAlt} /> : null}
        </div>
        <div className="card-content">
          {children}
        </div>
        <div className="card-img">
          {img && imgSide === 'right' ? <img src={img} alt={imgAlt} /> : null}
        </div>
      </div>
      {detailsUrl ? <Link to={detailsUrl}>{detailsText ? detailsText : 'Learn more'}</Link> : null}
    </div>
  );
}
