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
  children,
}) => {
  return (
    <div className="pagetitle mb-5 border-0">
        {img 
          ? <img alt={imgAlt} title={title ? title: imgAlt} src={img} srcSet={imgSet} />
          : null
        }
      <div className="overlay d-flex justify-content-center border-0">
        {children}
      </div>
    </div>
  );
}
