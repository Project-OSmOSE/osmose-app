import React from 'react';

import './styles.css';

export interface PageTitleProps {
  title?: string;
  img?: string;
  imgAlt?: string;
  imgSet?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  img,
  imgAlt,
  imgSet,
  children
}) => {
  return (
    <div className="pagetitle mb-5">
      <img className="" alt={imgAlt} title={imgAlt} src={img}
      srcSet={imgSet}
      // card-img-top
      // srcset="imagePath_400.webp 400w, imagePath_640.webp 640w"
      />
      <div className="overlay d-flex justify-content-center">
        {children}
      </div>
    </div>
  );
}
