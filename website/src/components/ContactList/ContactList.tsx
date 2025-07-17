import React from "react";
import { TeamMember } from "../../models/team";
import { Link } from "react-router-dom";
import './ContactList.css';

interface ContactListProps {
  label?: string;
  teamMembers?: Array<TeamMember>;
  namedMembers?: Array<string>;
}

export const ContactList: React.FC<ContactListProps> = ({
                                                          label,
                                                          teamMembers,
                                                          namedMembers
                                                        }) => {
  if ((!teamMembers || teamMembers.length < 1) && (!namedMembers || namedMembers.length < 1))
    return <React.Fragment></React.Fragment>;

  return (
    <p id="contact-list" className="text-muted">
      { label && <span>{ label }: </span> }

      { teamMembers && teamMembers.map((member, k) => (
        <span key={ member.id }>
                    <Link to={ `/people/${ member.id }` }>
                        { member.contact.initial_names }
                    </Link>
          { (k < teamMembers.length - 1 || (namedMembers && namedMembers.length > 0)) && ', ' }
                </span>
      )) }


      { namedMembers && namedMembers.map((member, k) => (
        <span key={ member }>
                    { member }
          { k < namedMembers.length - 1 && ', ' }
                </span>
      )) }
    </p>
  );
}
