import React from 'react';
// import { TreeList } from '../TreeList';
import './styles.css';

interface TreeListItemProps {
  tagTitle: string,
  tagObject: any;
}

export const TreeListItem: React.FC<TreeListItemProps> = ({
  tagTitle,
  tagObject
}) => {

  return (
    <li className="treelistitem">
      <a href={"/ontology?" + tagTitle}> {tagObject.engName} </a>
    </li>
  );
}
