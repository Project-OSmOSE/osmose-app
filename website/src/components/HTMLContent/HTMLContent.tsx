import React from 'react';
import { parseHTML } from "../../utils";
import './HTMLContent.css';

interface HTMLContentProps {
  content: string;
}

export const HTMLContent: React.FC<HTMLContentProps> = ({ content }) => (
  <div id="html-content">
    { parseHTML(content) }
  </div>
)