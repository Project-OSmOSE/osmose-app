import { control, LatLngExpression, Map as LeafletMap, TileLayer } from "leaflet";
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getMinZoom } from './utils.functions'

export function initMap(id: string): LeafletMap {
  const map = new LeafletMap(id, {
    minZoom: 2,
    zoom: 3,
    maxZoom: 11,
    zoomControl: false,
    preferCanvas: true,
  }).setMaxBounds([ [ -200, -200 ], [ 200, 200 ] ]);
  new TileLayer.WMS("https://wms.gebco.net/mapserv?",
    {
      "attribution": "",
      "format": "image/png",
      "layers": "GEBCO_latest",
      "styles": "",
      "transparent": true,
      "version": "1.3.0",
      "noWrap": true,
      "bounds": [ [ -90, -180 ], [ 90, 180 ] ],
    }).addTo(map);
  control.scale().addTo(map)
  return map
}

export function clearMap(map: LeafletMap): void {
  map.off()
  map.remove()
}

export function setMapView(map: LeafletMap,
                           deployments: Array<{ latitude: number; longitude: number; }>): void {
  if (deployments.length === 0) {
    map.setView([ 0, 0 ], 2);
    return;
  }
  const minCoordinates: LatLngExpression = [
    Math.min(...deployments.map(d => d.latitude)),
    Math.min(...deployments.map(d => d.longitude)),
  ];
  const maxCoordinates: LatLngExpression = [
    Math.max(...deployments.map(d => d.latitude)),
    Math.max(...deployments.map(d => d.longitude)),
  ];
  const halfLatitude = (maxCoordinates[0] - minCoordinates[0]) / 2;
  const halfLongitude = (maxCoordinates[1] - minCoordinates[1]) / 2;
  const longitudeZoom = getMinZoom(180 / (maxCoordinates[1] - minCoordinates[1]))
  const latitudeZoom = getMinZoom(180 / (maxCoordinates[0] - minCoordinates[0]))
  map.setView(
    [
      minCoordinates[0] + halfLatitude,
      minCoordinates[1] + halfLongitude,
    ],
    Math.max(2, Math.min(longitudeZoom, latitudeZoom))
  );
}