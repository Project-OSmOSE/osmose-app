import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface CardArticleProps {
  id?: string;
  title?: string;
  vignette?: string;
  intro?: string;
  date?: string;
}

export const CardArticle: React.FC<CardArticleProps> = ({
  id = '',
  title = '',
  vignette = '',
  intro = '',
  date = '',
  children
}) => {
  const regex = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/ig;
  const result_d_m_years = regex.exec(date);
  let dateInWords = null;
  if (result_d_m_years !== null) {
    dateInWords = new Date(
      parseInt(result_d_m_years[3]),
      parseInt(result_d_m_years[2])-1,
      parseInt(result_d_m_years[1]),
      0, 0, 0
    ).toLocaleString(
      'en-GB', 
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );
  }

  return (
    <article className="card cardArticle border-0">
      <div className="card-body">
        <p className="small"><Link to={"/news"}> {"< return to news"}</Link></p>
        {title ? <h1 className="card-title">{title}</h1> : null}
        {dateInWords ? <span className="small text-muted">{dateInWords}</span> : null}
        <div className="card-text my-4">
          {children}
        </div>
      </div>
    </article>
  );
}
