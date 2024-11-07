import React, { Fragment } from "react";
import { Institution } from "@pam-standardization/metadatax-ts";

export const InstitutionLink: React.FC<{ institution: Institution }> = ({ institution }) => {
  if (institution.website) return <a href={ institution.website } target="_blank"
                                     rel="noopener noreferrer">{ institution.name }</a>;
  else return <Fragment>{ institution.name }</Fragment>;
}