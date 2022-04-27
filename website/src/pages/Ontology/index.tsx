// import { BreadCrumb } from '../../components/BreadCrumb';
import { TagShowing } from '../../components/TagShowing';
import { WorldMap } from '../../components/WorldMap';

import jsonFile from '../../ontology.json';
import './styles.css';
// import musicFile from '../../img/music_kkivb11.mp3';

function getAllSeenSpecies(ontology: any){
  let result: Array<string> = [];

  for (let key in ontology) {
    if(ontology[key].occurrence !== 0){
      result.push(key)
    }
  }
  return result;  
}

export const Ontology: React.FC = () => {

  let urlQuery = window.location.search.slice(1);
  const ontology = JSON.parse(JSON.stringify(jsonFile));
  const seenSpecies = getAllSeenSpecies(ontology);

  return (
<div className="ontology">
  {/* <div className="container-fluid">
    <BreadCrumb 
      tagTitle={urlQuery}
      ontology={ontology}
    />
  </div> */}

  <div className="container my-5">
    <h1>{urlQuery}</h1>
    
    <TagShowing
      tagTitle={urlQuery}
      ontology={ontology}
      seenSpecies={seenSpecies}
    />
  </div>

  {/* <div className="container my-5">
    <h2>Sound examples</h2>
    <audio controls preload="auto">
      <source src={musicFile} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div> */}

  <div className="container my-5">
    <h2>Occurences in datasets</h2>

    <WorldMap
    // datasetList=""
    >
    </WorldMap>
  </div>

</div>
  );
}