import React from 'react';

import './styles.css';

export interface PageTitleProps {
    img: string;
    imgAlt: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ img, imgAlt, children }) => {
    return (
        <div id="page-title" className="pagetitle mb-5 border-0">
            <img src={ img } alt={ imgAlt }/>

            <h1>{ children }</h1>
        </div>
    );
}
