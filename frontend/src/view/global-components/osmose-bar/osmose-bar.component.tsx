import logo from "../../../../public/images/ode_logo_192x192.png";
import './osmose-bar.component.css';

export const OsmoseBarComponent = () => {
  return (
    <div id="osmose-bar-component">
      <p>Proposed by</p>
      <a id="osmose-link" href="/..">OSmOSE <img src={ logo } alt="OSmOSE"/></a>
    </div>
  );
};
