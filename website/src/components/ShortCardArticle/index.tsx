import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface ShortCardArticleProps {
  id?: string;
  title?: string;
  vignette?: string;
  intro?: string;
  date?: string;
}

export const ShortCardArticle: React.FC<ShortCardArticleProps> = ({
  id = "",
  title = "",
  vignette = "",
  intro = "",
  date = "",
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

  // TODO obligation d'avoir title, id et children sinon affichage vide
  return (
    <section className="card shortCardArticle border-0">
      {vignette ? <img className="card-vignette" src={vignette} alt={"Vignette"} title={"Vignette"} /> : null}
      <div className="card-body">
        <h2 className="card-title">{title ? title : 'Not found'}</h2>
        <div className="card-text">
          {dateInWords ? <span className="small text-muted">{dateInWords}</span> : null}
          <p className='my-4'>{children ? children : ""}</p>
          {id ? <p className="text-end"><Link to={"/article/"+id}>read more...</Link></p> : null}
        </div>
      </div>
    </section>
  );
}
