import React from "react";
import { alphanumeric_keys } from "../../utils.tsx";

export const Tooltip: React.FC<{ id: number, hide?: boolean }> = ({ id, hide }) => {
  if (hide) return (<div key={ `tooltip_${ id }` }></div>)
  return (
    <div className="card" key={ `tooltip_${ id }` }>
      <h3 className={ `card-header p-2 tooltip-header tooltip-header__${ id.toString() }` }>Shortcut</h3>
      <div className="card-body p-1">
        <p>
          <span className="font-italic">{ alphanumeric_keys[1][id] }</span>
          { " or " }
          <span className="font-italic">{ alphanumeric_keys[0][id] }</span>
          { " : choose this tag" }<br/>
          <span
            className="font-italic">{ `${ alphanumeric_keys[1][id] } + ${ alphanumeric_keys[1][id] }` }</span>
          { " or " }
          <span
            className="font-italic">{ `${ alphanumeric_keys[0][id] } + ${ alphanumeric_keys[0][id] }` }</span>
          { " : delete all annotations of this tag" }
        </p>
      </div>
    </div>
  )
}