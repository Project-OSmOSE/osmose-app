import React, { Fragment } from "react";
import { Author } from "../../models/bibliography";
import { Link } from "react-router-dom";

export const Authors: React.FC<{ authors: Author[] }> = ({ authors }) => <Fragment>

  { authors
    .sort((a, b) => a.order - b.order)
    .map((author, key) => <Fragment>
      { key !== 0 && <span key={ key }>, </span> }

      { author.scientist.team_member &&
          <Link key={ author.id } to={ `/people/${ author.scientist.team_member }` }>
            { author.scientist.short_name }
          </Link> }
      { !author.scientist.team_member &&
          <span key={ author.id }>{ author.scientist.short_name }</span> }
    </Fragment>)
  }

</Fragment>