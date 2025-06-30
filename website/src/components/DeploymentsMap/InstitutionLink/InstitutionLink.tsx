import React, { Fragment } from "react";
import { Institution } from "@pam-standardization/metadatax-ts";
import { ContactNode } from "../../../../../../metadatax-ts/src";

export const InstitutionLink: React.FC<{ institution: Institution }> = ({ institution }) => {
  if (institution.website) return <a href={ institution.website } target="_blank"
                                     rel="noopener noreferrer">{ institution.name }</a>;
  else return <Fragment>{ institution.name }</Fragment>;
}

export const ContactLink: React.FC<{ contact: ContactNode }> = ({ contact }) => {
  if (contact.website) return <a href={ contact.website } target="_blank"
                                     rel="noopener noreferrer">{ contact.name }</a>;
  else return <Fragment>{ contact.name }</Fragment>;
}
