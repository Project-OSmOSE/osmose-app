import { PageTitle } from '../../components/PageTitle';
import { WorldMap } from '../../components/WorldMap';
// import { TileLayer, Marker, Popup } from 'react-leaflet';
import { TagShowing } from '../../components/TagShowing';
import { Link } from 'react-router-dom';

import './styles.css';
import jsonFile from '../../ontology.json';
import imgExplore from '../../img/illust/pexels-jeremy-bishop-2422915_1920_thin.jpg';

function arraysIntersection(array1: Array<string>, array2: Array<string>){
  let intersection: Array<string> = [];
  
  if(array2 && array2.length > 0 && array1 && array1.length > 0){
    intersection = array1.filter((value: string) => array2.includes(value));
  }
  return intersection;
}

function getFamilies(ontology: any){
  let result: Array<string> = [];

  for (let key in ontology) {
    if(ontology[key].parentTag === "root"){
      result.push(key)
    }
  }
  return result;  
}

function getSeenSpecies(ontology: any){
  let result: Array<string> = [];

  for (let key in ontology) {
    if(ontology[key].occurrence > 0){
      result.push(key)
    }
  }
  return result;  
}

function createElems(ontology : any, seenSpecies: Array<string>, seenFamilies: Array<string>){
  const elems: Array<any> = seenFamilies.map(function(tagTitle: string) {
    return (
      <div key={tagTitle + "-container"}>
        <h3> <Link to={'ontology?' + tagTitle}> {ontology[tagTitle].engName} </Link> </h3>
        <TagShowing
          tagTitle={tagTitle}
          ontology={ontology}
          seenSpecies={seenSpecies}
          // image="no"
        />
      </div>
    )}
  );
  return elems;
}

export const Explore: React.FC = () => {
  const ontology: any = JSON.parse(JSON.stringify(jsonFile));
  const seenSpecies: Array<string> = getSeenSpecies(ontology);

  return (
<div className="explore">

  <PageTitle
    img={imgExplore}
    imgAlt="Explore Banner"
    // imgSet=""
  >
    <h1 className="align-self-center">
      Explore
    </h1>
  </PageTitle>

  <div className="container my-5">
    <h2>Datasets</h2>
    <WorldMap
    // datasetList=""
    >
    </WorldMap>
  </div>

  <div className="container my-5">
    <h2 id="ontology">Ontology</h2>

    <div className="container grid-container">

      {createElems(ontology, seenSpecies, arraysIntersection(seenSpecies, getFamilies(ontology)))}

    </div>
  </div>
</div>
  );
}
