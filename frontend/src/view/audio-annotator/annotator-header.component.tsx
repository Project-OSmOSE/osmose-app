import React, { Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTaskService } from "../../services/annotator/task";

const USER_GUIDE_URL = "https://github.com/Project-OSmOSE/osmose-app/blob/master/docs/user_guide_annotator.md";

const HeaderLink: React.FC<{ url?: string, children: ReactNode }> = ({ url, children }) => {
  if (!url) return <Fragment/>;
  return (
    <span>
      <a href={ url }
         rel="noopener noreferrer"
         target="_blank">
        { children }
      </a>
    </span>
  )
}

export const AnnotatorHeader: React.FC = () => {

  const { context } = useTaskService();

  return (
    <div className="row">
      <h1 className="col-sm-6">APLOSE</h1>


      <p className="col-sm-4 annotator-nav">
        <HeaderLink url={ USER_GUIDE_URL }>
          <span className="fas fa-question-circle"></span>&nbsp;Annotator User Guide
        </HeaderLink>

        <HeaderLink url={ context.currentTask?.instructions_url }>
          <span className="fas fa-info-circle"></span>&nbsp;Campaign instructions
        </HeaderLink>
      </p>

      <ul className="col-sm-2 annotator-nav">
        <li>
          <Link className="btn btn-danger"
                to={ `/annotation_tasks/${ context.currentTask?.campaignId }` }
                title="Go back to annotation campaign tasks">
            Back to campaign
          </Link>
        </li>
      </ul>
    </div>)
}