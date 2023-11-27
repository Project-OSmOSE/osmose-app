import React from 'react';
import {Link} from "react-router-dom";

import {TeamMember} from "../../models/team";

import './styles.css';


export const CardMember: React.FC<{ member: TeamMember }> = ({member}) => {
    return (
        <Link to={`/people/${member.id}`} className="card-member" >
            <img src={member.picture} alt={`${member.name}'s Portrait`} title={`${member.name}'s Portrait`}/>
            <h5>{ member.name }</h5>
            <p><small className="text-muted">{ member.position }</small></p>
        </Link>
    );
}
