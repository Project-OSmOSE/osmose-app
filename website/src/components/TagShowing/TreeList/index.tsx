import React from 'react';
import { TreeListItem } from '../TreeListItem';
import './styles.css';

interface TreeListProps {
  tagObject: any;
}

function createItems(childrenTags: Array<string>){
  let elems: Array<any> = [];
  if(childrenTags !== null || childrenTags !== undefined ){
    elems = childrenTags.map((value) => <TreeListItem tagTitle={value} key={value} />)
  }
  return elems;
}

export const TreeList: React.FC<TreeListProps> = (tagObject) => {

  return (
    <div className="treelist" id={tagObject.tagObject.engName + "-treelist"}>
      <ul>
        {createItems(tagObject.tagObject.childrenTag)}
      </ul>
    </div>
  );
}
