import React, { ReactNode } from "react";
import './DetailPage.css';

export const DetailPage: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div id="detail-page-component">
    { children }
  </div>
)
