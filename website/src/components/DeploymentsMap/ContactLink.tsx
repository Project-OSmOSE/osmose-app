import React, { Fragment } from "react";
import { Contact, Institution } from "../../pages/Projects/ProjectDetail/ProjectDetail";


export const ContactLink: React.FC<{ contact: Contact }> = ({ contact }) => {
  if (contact.website) return <a href={ contact.website } target="_blank"
                                 rel="noopener noreferrer">{ contact.firstName } { contact.lastName }</a>;
  else return <Fragment>{ contact.firstName } { contact.lastName }</Fragment>;
}

export const InstitutionLink: React.FC<{ institution: Institution }> = ({ institution }) => {
  if (institution.website) return <a href={ institution.website } target="_blank"
                                     rel="noopener noreferrer">{ institution.name }</a>;
  else return <Fragment>{ institution.name }</Fragment>;
}
