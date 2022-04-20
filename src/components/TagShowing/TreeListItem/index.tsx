import React from 'react';
// import { TreeList } from '../TreeList';
import './styles.css';

// function getTagObject(tagName: string){
//   const jsonObject = JSON.parse(JSON.stringify(jsonFile));
//   const tagObject = jsonObject[tagName];
//   return tagObject;
// }

interface TreeListItemProps {
  tagTitle: string;
}

export const TreeListItem: React.FC<TreeListItemProps> = (tagTitle) => {

  return (
    <li className="treelistitem">
      <a href={"/ontology?" + tagTitle.tagTitle}> {tagTitle.tagTitle} </a>
    </li>
  );
}
