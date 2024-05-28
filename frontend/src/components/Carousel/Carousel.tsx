import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { News } from '../../models/news';
import { API_FETCH_INIT } from "../../utils";
import './Carousel.css';

const NEWS_URL = '/api/news';


export const Carousel: React.FC = () => {
  const [news, setNews] = React.useState<Array<News>>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch(`${ NEWS_URL }?page=1&page_size=3`, API_FETCH_INIT);
      if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
      const data = await response.json();
      setNews(data.results);
    };
    fetchNews().catch(error => console.error(`Cannot fetch carrousel news, got error: ${ error }`));
  }, []);

  if (news.length === 0) return (<div></div>);

  const content = news.map((newsArticle, i) => {
    newsArticle.id = newsArticle?.id ?? "";
    newsArticle.title = newsArticle?.title ?? "";
    newsArticle.date = newsArticle?.date ?? "";
    newsArticle.intro = newsArticle?.intro ?? "";
    newsArticle.thumbnail = newsArticle?.thumbnail ?? "";

    return (
      <div className={ "carousel-item " + (i === 0 ? "active" : "") } key={ newsArticle.id }>
        <div className="card px-5 border-0">
          <div className="row no-gutters">
            <div className="col-md-4 d-flex align-items-center justify-content-center px-4 px-md-0">
              <img className="card-img" src={ newsArticle.thumbnail ? newsArticle.thumbnail : '' } alt="" title=""/>
            </div>
            <div className="col-md-8">
              <div className="card-body">
                { newsArticle.title ? <h4 className="card-title">{ newsArticle.title }</h4> : null }
                { newsArticle.date ?
                  <p className="card-text"><small className="text-muted">{ newsArticle.date }</small></p> : null }
                <div className="card-text">
                  <p className="quote">
                    { newsArticle.intro }
                  </p>
                  <p>
                    <Link to={ "/news/" + String(newsArticle.id) }>Read full story</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div id="carousel-home" className="carousel carousel-dark slide border rounded" data-bs-ride="carousel">
      <div className="carousel-inner">
        { content }
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#carousel-home" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#carousel-home" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
