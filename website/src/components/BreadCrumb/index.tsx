import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

function getParentTag(tagTitle: string, ontology: any){
  let parentTagTitle: string = "";
  if(ontology[tagTitle].parentTag){
    parentTagTitle = ontology[tagTitle].parentTag;
  }
  return parentTagTitle;
}

function createLi(tagTitle: string, ontology: any){
  let liElem;
  if(tagTitle){
    liElem =
      <li>
        <Link to={'ontology?' + tagTitle}> 
          {ontology[tagTitle].engName} 
        </Link>
      </li>
    ;
  }
  return liElem;
}

export interface BreadCrumbProps {
  tagTitle: string
  ontology: any;
}

export const BreadCrumb: React.FC<BreadCrumbProps> = ({
  tagTitle,
  ontology
}) => {
  console.log(ontology)

  return (
<div className="breadcrumb-container my-3">
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb" id="ariane">
      {createLi(getParentTag(tagTitle, ontology), ontology)}
      <li>{ontology[tagTitle].engName}</li>
    </ol>
  </nav>
</div>
  );
}
