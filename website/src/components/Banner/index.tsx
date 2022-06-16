import React from 'react';

import './styles.css';

export const Banner: React.FC = ({
  children
}) => {
  return (
    <div className="my-4 banner d-flex flex-wrap justify-content-around align-items-center">
      {children}
    </div>
  );
}
