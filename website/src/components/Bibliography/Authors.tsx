import React, { Fragment } from "react";
import { Author } from "../../models/bibliography";
import { Link } from "react-router-dom";

export const Authors: React.FC<{ authors: Author[] }> = ({ authors }) => <Fragment>

  { authors
    .sort((a, b) => a.order - b.order)
    .map((author, key) => <Fragment key={ key }>
      { key !== 0 && <span>, </span> }

      { author.contact.team_member && !author.contact.team_member?.is_former_member &&
          <Link to={ `/people/${ author.contact.team_member?.id }` }>
            { author.contact.initial_names }
          </Link> }
      { (!author.contact.team_member || author.contact.team_member?.is_former_member) &&
          <span>{ author.contact.initial_names }</span> }
    </Fragment>)
  }

</Fragment>