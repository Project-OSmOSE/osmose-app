import React from "react";
import { Link } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import './Back.css';

interface BackProps {
  path: string;
  pageName?: string;
}

export const Back: React.FC<BackProps> = ({ path, pageName }) => (
  <Link to={ path } id="back-component">
    <IoChevronBackOutline/>
    Back { pageName && `to ${ pageName }` }
  </Link>
)
