import React, { ReactNode } from 'react';

import './styles.css';

export interface PageTitleProps {
  img: string;
  imgAlt: string;
  children: ReactNode;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ img, imgAlt, children, className }) => {
  return (
    <div id="page-title" className={ ["pagetitle mb-5 border-0", className].join(' ') }>
      <img src={ img } alt={ imgAlt }/>

      <h1>{ children }</h1>
    </div>
  );
}
