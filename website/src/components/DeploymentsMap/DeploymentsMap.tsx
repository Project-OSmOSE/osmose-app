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
import { DeploymentAPI } from "@pam-standardization/metadatax-ts";
import { ClusterTooltip, MarkerTooltip } from './Tooltips';
import { clearMap, initMap, setMapView } from './map.functions';
import './DeploymentsMap.css'
import { getColorLuma, getRandomColor } from "./utils.functions";
import { DeploymentPanel, FilterPanel } from "./Panels";

interface Feature {
  properties: {
    deployment: DeploymentAPI;
  }
}

export const DeploymentsMap: React.FC<{
  projectID?: number;
  allDeployments: Array<DeploymentAPI>;
  selectedDeployment: DeploymentAPI | undefined;
  setSelectedDeployment: (deployment: DeploymentAPI | undefined) => void;
}> = ({ projectID, allDeployments, selectedDeployment, setSelectedDeployment }) => {
  const map = useRef<LeafletMap | null>(null);
  const clusterGroup = useRef<MarkerClusterGroup | null>(null);
  const mapID: string = useMemo(() => "map" + projectID ? '-' + projectID : '', [ projectID ]);
  const projectColorMap = useRef<Map<number, string>>(new Map());
  const deploymentsMarkers = useRef<Map<number, CircleMarker>>(new Map());

  const [ filteredDeployments, setFilteredDeployments ] = useState<Array<DeploymentAPI>>([]);

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
      projectColorMap.current,
    );
  }, [ allDeployments, filteredDeployments ]);

  const setDeploymentsToMap = (map: LeafletMap,
                               deployments: Array<DeploymentAPI>,
                               projectColorMap: Map<number, string>): void => {
    for (let project of new Set(deployments.map(d => d.project))) {
      if (projectColorMap.has(project.id)) continue;
      projectColorMap.set(project.id, getRandomColor());
    }

    clusterGroup.current = new MarkerClusterGroup({
      maxClusterRadius: 40,
      iconCreateFunction: (cluster: MarkerCluster) => {
        const icon: Icon | DivIcon = (clusterGroup.current as any)._defaultIconCreateFunction(cluster);
        const allDeployments: Array<DeploymentAPI> = cluster.getAllChildMarkers().map(child => {
          return child.feature?.properties.deployment;
        }).filter(element => !!element);
        const projects = [ ...new Set(allDeployments.map(d => d.project.id)) ]
        cluster.bindTooltip(renderToStaticMarkup(<ClusterTooltip deployments={ allDeployments }/>))
        let color = "#999999"
        if (projects.length === 1) color = projectColorMap.get(projects[0]) ?? color;
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
          fillColor: projectColorMap.get(feature.properties.deployment.project.id),
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