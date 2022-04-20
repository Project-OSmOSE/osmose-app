import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';
import jsonFile from '../../ontology.json';

export interface BreadCrumbProps {
  name: string;
}

export const BreadCrumb: React.FC<BreadCrumbProps> = ({
  name,
  children
}) => {

  const jsonStr = JSON.stringify(jsonFile);
  var jsonObject = JSON.parse(jsonStr);
  // console.log('jsonObject contains : ', typeof jsonObject, jsonObject);

  function populateBC() {
    // console.log('addChildrenTagList is called.');
    if (name !== undefined && name !== null && jsonObject[name] !== undefined){
      let tag: string = name;
      let tagName: string = jsonObject[name].engName;
      let olTrail = document.getElementById('ariane');
      // console.log('olTrail contains (before) : ', typeof olTrail, olTrail);
      if (olTrail != null && olTrail.children[0] === undefined){
        // créer un élément li puis l'ajouter dans le document
        for (let i = 0; i < 6; i++) {
          let liElem = document.createElement('li');
          liElem.classList.add('breadcrumb-item')
          let linkElem = document.createElement('a');
          if (i === 0){
            liElem.classList.add('active')
            liElem.innerText = tagName;
            olTrail.insertBefore(liElem, olTrail.firstElementChild); // s'il n'a pas d'élém enfant ?
          } else if (tag === 'root') {
            linkElem.href = "/explore#ontology";
            linkElem.innerText = "Ontology";
            liElem.appendChild(linkElem);
            olTrail.insertBefore(liElem, olTrail.firstElementChild);
            break;
          } else {
            linkElem.href = "/ontology?" + tag;
            linkElem.innerText = tagName;
            liElem.appendChild(linkElem);
            olTrail.insertBefore(liElem, olTrail.firstElementChild);
          }
          var newTag = jsonObject[tag].parentTag;
          if(newTag !== "root"){
            tagName = jsonObject[newTag].engName;
          }
          tag = newTag;
        }
        console.log('olTrail contains (after) : ', typeof olTrail, olTrail);
      // } else if (tagChildren == null) {
      }
    } else {
      console.log('Les valeurs n\'ont pas été envoyé au composant.');

    }
  }

  let timeoutID = window.setTimeout( () => {
    if (document.readyState === 'complete') {
      // console.log('set Interval/Timeout');
      populateBC();
      window.clearTimeout(timeoutID);
    }
  }, 200);

  return (
<div className="breadcrumb-container my-3">
  <nav aria-label="breadcrumb">
    <ol className="breadcrumb" id="ariane">
    </ol>
  </nav>
</div>
  );
}
