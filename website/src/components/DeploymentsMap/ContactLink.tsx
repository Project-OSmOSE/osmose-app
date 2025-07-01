import React, { Fragment } from "react";


export const ContactLink: React.FC<{ contact: { name: string; website: string; } }> = ({ contact }) => {
  if (contact.website) return <a href={ contact.website } target="_blank"
                                 rel="noopener noreferrer">{ contact.name }</a>;
  else return <Fragment>{ contact.name }</Fragment>;
}
