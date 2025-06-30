import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CircleMarker,
  DivIcon,
  GeoJSON,
  Icon,
  LatLng,
  Layer,
  Map as LeafletMap,
  MarkerCluster,
  MarkerClusterGroup
} from 'leaflet';
import { ClusterTooltip, MarkerTooltip } from './Tooltips';
import { clearMap, initMap, setMapView } from './map.functions';
import './DeploymentsMap.css'
import { getColorLuma, intToRGB } from "./utils.functions";
import { DeploymentPanel, FilterPanel } from "./Panels";
import { DeploymentNode } from "../../../../../metadatax-ts/src";

interface Feature {
  properties: {
    deployment: DeploymentNode;
  }
}

export const DeploymentsMap: React.FC<{
  level: 'project' | 'deployment',
  projectID?: number;
  allDeployments: Array<DeploymentNode>;
  selectedDeployment: DeploymentNode | undefined;
  setSelectedDeployment: (deployment: DeploymentNode | undefined) => void;
}> = ({ level, projectID, allDeployments, selectedDeployment, setSelectedDeployment }) => {
  const map = useRef<LeafletMap | null>(null);
  const clusterGroup = useRef<MarkerClusterGroup | null>(null);
  const mapID: string = useMemo(() => "map" + projectID ? '-' + projectID : '', [ projectID ]);
  const deploymentsMarkers = useRef<Map<string, CircleMarker>>(new Map());

  const [ filteredDeployments, setFilteredDeployments ] = useState<Array<DeploymentNode>>([]);

  useEffect(() => {
    if (map.current) clearMap(map.current);
    map.current = initMap(mapID);
    setMapView(map.current, allDeployments);
    setFilteredDeployments(allDeployments);
  }, [ mapID, allDeployments ]);

  useEffect(() => {
    for (const [ deploymentID, marker ] of deploymentsMarkers.current.entries()) {
      marker.options.color = deploymentID === selectedDeployment?.id ? 'white' : 'black';
      marker.redraw()
    }
  }, [ selectedDeployment ]);

  useEffect(() => {
    if (!map.current) return;
    // TODO: remove only those that are filtered?
    clusterGroup.current?.remove();
    // TODO: redraw only missing
    setDeploymentsToMap(
      map.current,
      filteredDeployments,
    );
  }, [ allDeployments, filteredDeployments ]);

  const setDeploymentsToMap = (map: LeafletMap,
                               deployments: Array<DeploymentNode>): void => {

    clusterGroup.current = new MarkerClusterGroup({
      maxClusterRadius: 40,
      iconCreateFunction: (cluster: MarkerCluster) => {
        const icon: Icon | DivIcon = (clusterGroup.current as any)._defaultIconCreateFunction(cluster);
        const allDeployments: Array<DeploymentNode> = cluster.getAllChildMarkers().map(child => {
          return child.feature?.properties.deployment;
        }).filter(element => !!element);
        const projects = [ ...new Set(allDeployments.map(d => d.project.id)) ]
        const campaigns = [ ...new Set(allDeployments.map(d => d.campaign?.id).filter(id => id !== undefined)) ]
        cluster.bindTooltip(renderToStaticMarkup(<ClusterTooltip deployments={ allDeployments }/>))
        let color = "#999999"
        switch (level) {
          case "project":
            if (projects.length === 1) color = intToRGB(+projects[0]);
            break;
          case "deployment":
            if (campaigns.length === 1) color = intToRGB(+campaigns[0]!);
            break;
        }
        icon.options.className += ' cluster-icon';
        return new DivIcon({
          ...icon.options,
          html: `<div style="background-color: ${ color }; color: ${ getColorLuma(color) > 120 ? 'black' : 'white' };"><span>${ cluster.getAllChildMarkers().length }</span></div>`
        });
      },
    });
    clusterGroup.current.addLayer(new GeoJSON(deployments.map(deployment => ({
      type: 'Feature',
      properties: {
        deployment,
      },
      geometry: {
        "type": "Point",
        "coordinates": [ deployment.longitude, deployment.latitude ]
      }
    })) as any, {
      pointToLayer(feature: Feature, latlng: LatLng): Layer {
        const marker = new CircleMarker(latlng, {
          color: 'black',
          fillColor: intToRGB(+(level === 'project' ? feature.properties.deployment.project.id : feature.properties.deployment.campaign?.id ?? feature.properties.deployment.id)),
          fillOpacity: 1,
          radius: 10
        });
        deploymentsMarkers.current.set(feature.properties.deployment.id, marker);
        return marker;
      },
      onEachFeature(feature: Feature, layer: Layer) {
        layer.bindTooltip(renderToStaticMarkup(<MarkerTooltip deployment={ feature.properties.deployment }/>))
        layer.on({ click: () => setSelectedDeployment(feature.properties.deployment) })
      }
    }))
    map.addLayer(clusterGroup.current);
  }

  return <div id="map-container">
    <div id={ mapID } className="map"/>
    <FilterPanel allDeployments={ allDeployments } onFilter={ setFilteredDeployments }/>
    <DeploymentPanel deployment={ selectedDeployment }
                     disableProjectLink={ !!projectID }
                     onClose={ () => setSelectedDeployment(undefined) }/>
  </div>
}