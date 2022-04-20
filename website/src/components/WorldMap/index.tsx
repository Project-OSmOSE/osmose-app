import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { JsxChild, JsxElement, JsxEmit, JsxTagNameExpression } from 'typescript';

import './styles.css';

export interface WorldMapProps {
  datasetList?: Array<object>;
  // coord?: Array<number>;
  // metaData?: object;
  // description?: string;
}

var exampleSet = [
  {
    name: 'dataset 1',
    coord: [72.12, -53.13],
    time: 12
  },
  {
    name: 'dataset 2',
    coord: [2.12, 5.13],
    time: 12
  },
  {
    name: 'dataset 3',
    coord: [-32.12, 113.3],
    time: 12
  }
];

export const WorldMap: React.FC<WorldMapProps> = ({
  datasetList = exampleSet,
  // coord,
  // metaData,
  // children
}) => {
  // var exampleSet2 = [
  //   {
  //     name: 'dataset 1',
  //     coord: [72.12, -53.13],
  //     time: 12
  //   },
  //   {
  //     name: 'dataset 2',
  //     coord: [2.12, 5.13],
  //     time: 12
  //   },
  //   {
  //     name: 'dataset 3',
  //     coord: [-32.12, 113.3],
  //     time: 12
  //   }
  // ];

// addMarker(exampleSet2[1]);

  // interface datasetInterface {
  //   name: string,
  //   coord: Array<any>,
  //   time: number
  // }

  // function addMarker(aDataset: datasetInterface) { // aDataset: datasetInterface // exampleSet2[1]
  //   // let lat = exampleSet2[0].coord[0];
  //   // let long = exampleSet2[0].coord[1];
  //   return (
  //     // envoyer dans .leaflet-marker-pane appendchild
  //   <Marker 
  //   position={[aDataset.coord[0], aDataset.coord[1]]}
  //   // position={[4.0, 40.0]}
  //   >
  //     <Popup>
  //       {aDataset.name}
  //     </Popup>
  //   </Marker>
  //   );
  // }
  // var target = document.getElementsByClassName('leaflet-marker-pane')[0];

    // function addAllMarkers(){
    //   // let markers;
    //   for (let i = 0; i < exampleSet2.length; i++) {
    //     addMarker(exampleSet2[i]);
    //     // addMarker(exampleSet2[i]);
    //   }
    //   // return markers;
    // }

    // Fonction callback ?
  // function addMarkers() {
  //   let newMarker;
  //   // let markers: JSX.Element = <> </>;
  //   for (let i = 0; i < exampleSet2.length; i++) {
  //     // newMarker = datasetList[i];
  //     newMarker =
  //       <Marker position={[exampleSet2[i].coord[0], exampleSet2[i].coord[1]]} >
  //         <Popup>
  //           {exampleSet2[i].name}
  //         </Popup>
  //       </Marker>;
  //     console.log('newmarker vaut :', typeof newMarker, newMarker);
  //     // markers =+ newMarker;
  //     // target.appendChild(newMarker);
  //     // target.innerHTML =+ newMarker;
  //     // target.insertAdjacentElement("beforeend", newMarker)
  //   }
  //   // return(
  //   //   markers
  //   // );
  // }

  return (
    <div className="worldMap">

      {/* <div className="container-fluid">
        <h3>Localisation</h3>
      </div> */}

      <div className="container-fluid my-3 myMap">
        <MapContainer 
        center={[0.0, 0.0]} 
        zoom={2} 
        scrollWheelZoom={false}
        >
          <TileLayer
            // pastel colours map with bathymetry
            attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
            url='https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}'
            // maxZoom='13'
          />

          {/* <TileLayer
            // satellite map with bathymetry
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          /> */}

          <Marker 
          // position={coord}
          position={[0.0, 0.0]}
          >
            <Popup>
              Description here.
            </Popup>
          </Marker>

          <Marker 
          // position={coord}
          position={[12.0, -45.0]}
          >
            <Popup>
              Description here.
            </Popup>
          </Marker>

          <Marker 
          // position={coord}
          position={[-35.0, 225.0]}
          >
            <Popup>
              Description here.
            </Popup>
          </Marker>

          {/* {addMarker()} */}
          {/* {addAllMarkers()} */}
          {/* {addMarkers()} */}
          {/* {addMarker(exampleSet2[0])} */}
          {/* {addAllMarkers()} */}

        </MapContainer>

      </div>

      {/* <div className="container-fluid my-3 d-flex justify-content-between align-items-stretch infos">

        <div id="list">
          <h3>List</h3>
          <div>
            <!-- List of datasets -->
          </div>
        </div>

        <!-- <div id="metadata">
          <h3>MetaData</h3>
          <div>
            
          </div>
        </div> -->

      </div> */}
    </div>
  );
}