import React from 'react';
import { Link } from "react-router-dom";

import { TeamMember } from "../../models/team";

import './CardMember.css';


export const CardMember: React.FC<{ member: TeamMember }> = ({ member }) => {

  const content = (<React.Fragment>
    <img src={ member.picture }
         alt={ `${ member.contact.initial_names }'s Portrait` }
         title={ `${ member.contact.initial_names }'s Portrait` }/>
    <h5>{ member.contact.last_name } { member.contact.first_name }</h5>
    <p><small className="text-muted">{ member.position }</small></p>
  </React.Fragment>)

  if (member.is_former_member) return (<div id="card-member">{ content }</div>)

  return (<Link to={ `/people/${ member.id }` } id="card-member">{ content }</Link>
  )
};
