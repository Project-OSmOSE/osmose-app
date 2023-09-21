import { useParams } from "react-router-dom";

import {PageTitle} from "../../components/PageTitle";
import {ShortCardArticle} from "../../components/ShortCardArticle";
import {Pagination} from "../../components/Pagination";

import "./styles.css";
import imgPublications from '../../img/illust/pexels-element-digital-1370295.jpg';
import articles_data from '../../articles_data.js'; 

function getContent(articles: Array<any>) {
  const content = articles.map((art) => {
    art.intro = "";
    // art.intro = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Blanditiis iusto inventore nam quibusdam, distinctio velit, autem a omnis sed eveniet corporis tempore magnam facere voluptatibus, ad vitae officia natus nulla?";
    return (
      <ShortCardArticle
        title={art.title}
        // img=""
        // imgAlt=""
        stringDate={art.date}
        id={String(art.id)}
        key={String(art.id)}
      >
        {art.intro}
      </ShortCardArticle>
    );
  });

    return content;
}

export const News: React.FC = () => {
  const urlParams: any = useParams();
  const articleNb = articles_data.articles.length;
  const pageSize = 5;
  const currentPage = Number(urlParams.page);
  const articleStart = ((currentPage-1)*5);
  const articles = articles_data.articles.slice(articleStart, articleStart+pageSize);
  const content = getContent(articles);

  return (
    <div id="news">
      {/* <div className="parallax"> */}
        {/* <div className="wrapper "> */}
          <PageTitle img={imgPublications} imgAlt="News Banner">
            <h1 className="align-self-center">
              News
            </h1>
          </PageTitle>

          <div className="container">
            {content}

            <Pagination
              totalCount={articleNb}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          </div>
        {/* </div> */}
      {/* </div> */}
    </div>
  );
};
