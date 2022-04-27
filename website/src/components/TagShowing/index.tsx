import React from 'react';
import './styles.css';
import { TreeList } from '../TreeList';

interface TagShowingProps {
  tagTitle: string,
  ontology: any,
  seenSpecies: Array<string>;
}

export const TagShowing: React.FC<TagShowingProps> = ({
  tagTitle,
  ontology,
  seenSpecies,
}) => {

  return (
    <div className="tagshowing" id={tagTitle + "-tagshowing"}>
      <p>
        {ontology[tagTitle].engDesc}
      </p>

      <TreeList 
        tagTitle={tagTitle}
        ontology={ontology}
        seenSpecies={seenSpecies}
      />
    </div>
  );
}
