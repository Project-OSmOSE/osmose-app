import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface ShortCardArticleProps {
  id?: string;
  title?: string;
  img?: string;
  imgAlt?: string;
  stringDate?: string;
  desc?: string;
  authors?: string;
}

export const ShortCardArticle: React.FC<ShortCardArticleProps> = ({
  id = "",
  title = "",
  img = "", // banner
  imgAlt = "",
  stringDate = "",
  desc = "", // short description
  authors = ""
}) => {
  const regex = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/ig;
  const result_d_m_years = regex.exec(stringDate);
  let date = null;

  if (result_d_m_years !== null) {
    date = new Date(
      parseInt(result_d_m_years[3]),
      parseInt(result_d_m_years[2])-1,
      parseInt(result_d_m_years[1]),
      0, 0, 0
    );
  }

  return (
    <section className="card border-0">
      {img ?  <img className="card-img" src={img} alt={imgAlt} title={imgAlt} /> : null}
      <div className="card-body">
        {title ? <h2 className="card-title">{title}</h2> : null}
        <div className="card-text">
          {date ? <span className="small text-muted">{date.toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> : null}
          {desc}
          <br />
          <p className="text-end"><Link to={"/article/"+id}>read more...</Link></p>
        </div>
      </div>
    </section>
  );
}
