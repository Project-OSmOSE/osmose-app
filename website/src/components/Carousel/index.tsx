import React from 'react';
import { Link } from 'react-router-dom';

import { CardMember } from '../CardMember';

import './styles.css';

export interface CarouselProps {
    articles: Array<any>
}

export const Carousel: React.FC<CarouselProps> = ({
    articles
}) => {
    // const articles = articles.slice(0, 3);
    // console.log("articles[0].id : ", articles[0].id);
    const content = articles.map((art, i) => {
        // art.intro = "";
        art.intro = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Blanditiis iusto inventore nam quibusdam, distinctio velit, autem a omnis sed eveniet corporis tempore magnam facere voluptatibus, ad vitae officia natus nulla?";

        return (
            <div className={"carousel-item "+(i===0 ? "active" : "")}>
                <CardMember
                    name={art.title}
                    img="https://picsum.photos/200" // images must be square
                    imgSide="left"
                    imgAlt="Description."
                    job={art.date}
                    key={art.id}
                >
                    <p className="quote">
                        {art.intro}
                    </p>
                    <p>
                        <Link to={"/article/"+String(art.id)}>Read full story</Link>
                    </p>
                </CardMember>
            </div>
        );
    });

    return (
        <div id={"carousel-"+articles[0].id} className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
                {content}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target={"#carousel-"+articles[0].id} data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={"#carousel-"+articles[0].id} data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}
