import React from "react";
import { AlphanumericKeys } from "../../../consts/shorcuts.const.tsx";

export const TooltipComponent: React.FC<{ id: number }> = ({ id }) => (
  <div className="card">
    <h3 className={ `card-header p-2 tooltip-header tooltip-header__${ id.toString() }` }>Shortcut</h3>
    <div className="card-body p-1">
      <p>
          <span className="font-italic">
            { AlphanumericKeys[1][id] }
          </span>
        { " or " }
        <span className="font-italic">
            { AlphanumericKeys[0][id] }
          </span>
        { " : choose this tag" }

        <br/>

        <span className="font-italic">
            { `${ AlphanumericKeys[1][id] } + ${ AlphanumericKeys[1][id] }` }
          </span>
        { " or " }
        <span className="font-italic">
            { `${ AlphanumericKeys[0][id] } + ${ AlphanumericKeys[0][id] }` }
          </span>
        { " : delete all annotations of this tag" }
      </p>
    </div>
  </div>
)
