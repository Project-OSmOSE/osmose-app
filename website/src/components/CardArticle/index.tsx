import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface CardArticleProps {
  img?: string;
  imgAlt?: string;
  title?: string;
  article?: string;
  stringDate?:string;
  authors?: string;
  id?: string;
}

export const CardArticle: React.FC<CardArticleProps> = ({
  img,
  imgAlt = '',
  stringDate = "",
  title,
  article,
  authors,
  id = '',
  children
}) => {
  const regex = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/ig;
  const result_d_m_years = regex.exec(stringDate);
  let date = null;

  if (result_d_m_years !== null) {

    date = new Date(
      parseInt(result_d_m_years[3]),
      parseInt(result_d_m_years[2])-1,
      parseInt(result_d_m_years[1]),
      0, 0, 0)
  }

  return (
    <article className="card cardArticle border-0">
      {img ?  <img className="card-img" src={img} alt={imgAlt} title={imgAlt} /> : null}
      <div className="card-body">
        <p className="small"><Link to={"/news"}> {"< return to news"}</Link></p>
        {title ? <h2 className="card-title">{title}</h2> : null}
        {date ? <span className="small text-muted">{date.toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> : null}
        <div className="card-text my-4">
          {children}
        </div>
      </div>
    </article>
  );
}
