import React from 'react';
// import { Link } from 'react-router-dom';

import './styles.css';

export const Banner: React.FC = ({
  // images must be squares
  children
}) => {
  return (
    <div className="my-4 banner d-flex flex-wrap justify-content-around align-items-center">
      {children}
    </div>
  );
}
