import React from 'react';
import { Link } from "react-router-dom";

import { TeamMember } from "../../models/team";

import './CardMember.css';


export const CardMember: React.FC<{ member: TeamMember }> = ({ member }) => {

  if (member.is_former_member) return (
    <div id="card-member">
      <img src={ member.picture } alt={ `${ member.name }'s Portrait` } title={ `${ member.name }'s Portrait` }/>
      <h5>{ member.name }</h5>
      <p><small className="text-muted">{ member.position }</small></p>
    </div>
  )

  return (
    <Link to={ `/people/${ member.id }` } id="card-member">
      <img src={ member.picture } alt={ `${ member.name }'s Portrait` } title={ `${ member.name }'s Portrait` }/>
      <h5>{ member.name }</h5>
      <p><small className="text-muted">{ member.position }</small></p>
    </Link>
  )
};
