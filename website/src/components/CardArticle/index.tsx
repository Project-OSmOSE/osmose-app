import React from 'react';
// import { Link } from 'react-router-dom';

import './styles.css';

export interface CardArticleProps {
  img?: string;
  imgAlt?: string;
  title?: string;
  article?: string;
  stringDate?:string;
  authors?: string;
}

export const CardArticle: React.FC<CardArticleProps> = ({
  img, // images must be squares
  imgAlt = '',
  stringDate = "",
  title,
  article,
  authors,
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
    <section className="cardArticle">
        <div className="card border-0">
          <div className="d-flex flex-colum justify-content-center">
          {img ?  <img className="card-img" src={img} alt={imgAlt} title={imgAlt} /> : null}
            <div className="col-md-8 order-md-1">
              <div className="card-body">
              {title ? <h2 className="card-title">{title}</h2> : null}

              {date ? <small className="text-muted">{date.toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small> : null}
                <div className="card-text--card">{children}</div>
                </div>
            </div>
          </div>
            </div>
      </section>
  );
}
