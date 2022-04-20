import { PageTitle } from '../../components/PageTitle';
import { WorldMap } from '../../components/WorldMap';
// import { TileLayer, Marker, Popup } from 'react-leaflet';
import { TagShowing } from '../../components/TagShowing';

import './styles.css';
import jsonFile from '../../ontology.json';
import imgExplore from '../../img/illust/pexels-jeremy-bishop-2422915_1920_thin.jpg';

export const Explore: React.FC = () => {
  const ontology = JSON.parse(JSON.stringify(jsonFile));

  // const jsonStr = JSON.stringify(jsonFile);
  // const jsonObject = JSON.parse(jsonStr);
  // console.log('jsonObject contains : ', typeof jsonObject, jsonObject);

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
      <div className="half">
        <TagShowing
        tagTitle="delphinidae"
        tagObject={ontology.delphinidae}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="monodontidae"
        tagObject={ontology.monodontidae}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="mysticeti"
        tagObject={ontology.mysticeti}
        titleLevel="h3"
        // image="no"
        />
      </div>

      <div className="half">
        <TagShowing
        tagTitle="phocoeninae"
        tagObject={ontology.phocoeninae}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="physeteroidea"
        tagObject={ontology.physeteroidea}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="ziphidae"
        tagObject={ontology.ziphidae}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="human"
        tagObject={ontology.human}
        titleLevel="h3"
        // image="no"
        />

        <TagShowing
        tagTitle="nature"
        tagObject={ontology.nature}
        titleLevel="h3"
        // image="no"
        />
      </div>
    </div>
  </div>
</div>
  );
}
