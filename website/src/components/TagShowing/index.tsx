import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';
import { TreeList } from './TreeList';

const imgPath = '../../img/ontology/';

// test if tag is found in ontology
// needed to send it to the component
function testTag(tagTitle: string) {
  if (tagTitle === undefined || tagTitle === null){
    return (
      <div className="treelist">
        <h3> Not Found. </h3>
        <p>
          No such tag was found. You can go back to the <Link to="/explore"> explore </Link> page
        </p>
      </div>
    );
  }
}

// if tagOccurence = 0, do not show tag (and treelist) unless titleLevel = 'h1'
function hideIfNoOccurence(tagObject: any, titleLevel: string) {
  if (tagObject.occurrence < 1 && titleLevel !== 'h1'){
    let currentTree = document.getElementById(tagObject.engName + "-treelist");
    if(currentTree !== null && currentTree !== undefined){
      currentTree.classList.add('nodisplay');
    }
  }
}

interface TagShowingProps {
  tagTitle: string,
  tagObject: any,
  titleLevel: string;
}

export const TagShowing: React.FC<TagShowingProps> = ({
  tagTitle,
  tagObject,
  titleLevel
}) => {
  const tagPagePath = "/ontology?" + tagTitle;
  // var totalOccurence: number;

  // let timeoutID = window.setTimeout( () => {
  //   if (document.readyState === 'complete') {
  //     // console.log('set Interval/Timeout');
  //     testTag(tagTitle);
  //     hideIfNoOccurence(tagObject, titleLevel);
  //     addChildrenTagList();
  //     window.clearTimeout(timeoutID);
  //   }
  // }, 400);

  return (
    <div className="tagshowing" id={tagObject.engName + "-tagshowing"}>
      {titleLevel === 'h1' ? <h1> {tagTitle} </h1> : null}
      {titleLevel === 'h2' ? <h2> <Link to={tagPagePath}> {tagTitle} </Link> </h2> : null}
      {titleLevel === 'h3' ? <h3> <Link to={tagPagePath}> {tagTitle} </Link> </h3> : null}
      {tagObject.image !== 'example.jpg' ? <img src={imgPath + tagObject.image} alt={"Picture of a "+ tagTitle} className="illustration my-2" /> : null}
      {/* {tagObject.image !== 'example.jpg' ? <img src={imgExample} alt={"Picture of a "+ tagName} className="illustration my-2" /> : null} */}
      <p>
        {tagObject.engDesc} 
        {/* {tagOccurrence !== 0 ? <span className="badge badge-pill text-secondary"></span>{tagOccurrence + " occurrences"}</span> : null} */}
      </p>
      <TreeList tagObject={tagObject} />
    </div>
  );
}
