import React from 'react';
import { TreeListItem } from '../TreeListItem';
import './styles.css';

interface TreeListProps {
  tagTitle: string,
  ontology: any,
  seenSpecies: Array<string>;
}

function arraysIntersection(array1: Array<string>, array2: Array<string>){
  let intersection: Array<string> = [];
  if(array2 && array2.length > 0 && array1 && array1.length > 0){
    intersection = array1.filter((value: string) => array2.includes(value));
  }
  return intersection;
}

function createElems(tagTitle: string, ontology : any, seenSpecies: Array<string>){
  let elems: Array<any> = [];
  let childrenTags = ontology[tagTitle].childrenTag

  if(childrenTags && childrenTags.length > 0){
    elems = seenSpecies.map((value: string) => <TreeListItem tagTitle={value} tagObject={ontology[value]} key={value} />)
  }
  return elems;
}

export const TreeList: React.FC<TreeListProps> = ({
  tagTitle,
  ontology,
  seenSpecies,
}) => {

  return (
    <div className="treelist" id={ontology[tagTitle].engName + "-treelist"}>
      <ul>
        {createElems(tagTitle, ontology, arraysIntersection(seenSpecies, ontology[tagTitle].childrenTag))}
      </ul>
    </div>
  );
}
