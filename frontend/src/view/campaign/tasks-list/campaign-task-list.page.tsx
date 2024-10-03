import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AnnotationTaskList as List,
  useAnnotationFileRangeAPI,
  useAnnotationTaskAPI,
  AnnotationFileRange, AnnotationTask
} from "@/services/api";
import { ANNOTATOR_GUIDE_URL } from "@/consts/links.ts";
import { IonButton, IonIcon } from "@ionic/react";
import { helpBuoyOutline, informationCircle } from "ionicons/icons";
import './campaign-task-list.page.css';

export const AnnotationTaskList: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const [ tasks, setTasks ] = useState<List | undefined>(undefined);

  const [ fileRanges, setFileRanges ] = useState<Array<AnnotationFileRange & { tasks: Array<AnnotationTask> }>>([]);
  const campaign = useMemo(() => {
    if (fileRanges.length === 0) return undefined;
    return fileRanges[0].annotation_campaign;
  }, [ fileRanges ]);

  const taskService = useAnnotationTaskAPI();
  const fileRangeService = useAnnotationFileRangeAPI();
  const [ error, setError ] = useState<any | undefined>(undefined);

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: 'instant' })
    let isCanceled = false;

    setError(undefined);
    Promise.all([
      taskService.list(campaignID).then(setTasks),
      fileRangeService.listForCampaignWithTasks(+campaignID).then(setFileRanges)
    ]).catch(e => {
      if (isCanceled) return;
      setError(e);
      throw e
    })

    return () => {
      isCanceled = true;
      taskService.abort();
      fileRangeService.abort();
    }
  }, [ campaignID ]);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openInstructions = () => {
    if (!campaign?.instructions_url) return;
    window.open(campaign.instructions_url, "_blank", "noopener, noreferrer")
  }


  if (error) {
    return (
      <Fragment>
        <h1>Annotation Tasks</h1>
        <p className="error-message">{ error.message }</p>
      </Fragment>
    )
  }

  return (
    <div id="campaign-task-list">

      <div className="head">
        <h2>{ campaign?.name }</h2>
        <p className="subtitle">Annotation Tasks</p>
      </div>

      <div className="d-flex justify-content-center gap-1 flex-wrap">
        <IonButton color="warning" shape="round" fill="outline" onClick={ openGuide }>
          User guide
          <IonIcon icon={ helpBuoyOutline } slot="end"/>
        </IonButton>
        { campaign?.instructions_url && <IonButton color="secondary" onClick={ openInstructions }>
            <IonIcon icon={ informationCircle } slot="start"/>
            Campaign instructions
        </IonButton> }
      </div>
      <table className="table table-bordered">
        <thead>
        <tr>
          <th>Filename</th>
          <th>Dataset</th>
          <th>Date</th>
          <th>Duration</th>
          <th>Results</th>
          <th>Status</th>
          <th>Link</th>
        </tr>
        </thead>
        <tbody>
        { fileRanges.map((range, index) => <Fragment>
          { index > 0 && <tr className="empty"></tr> }
          { range.tasks.map(task => {
            const startDate = new Date(task.dataset_file.start);
            const diffTime = new Date(new Date(task.dataset_file.end).getTime() - startDate.getTime());
            return <tr className={ task.status === 'Finished' ? 'table-success' : 'table-warning' }
                       key={ task.id }>
              <td>{ task.dataset_file.filename }</td>
              <td>{ task.dataset_file.dataset_name }</td>
              <td>{ startDate.toLocaleDateString() }</td>
              <td>{ diffTime.toUTCString().split(' ')[4] }</td>
              <td>{ task.results_count }</td>
              <td>{ task.status }</td>
              <td><Link to={ `/audio-annotator/${ task.id }` }>Task link</Link></td>
            </tr>
          })
          }
        </Fragment>) }
        { tasks?.map(task => {
          const startDate = new Date(task.start);
          const diffTime = new Date(new Date(task.end).getTime() - startDate.getTime());
          return (<tr className={ task.status === 'Finished' ? 'table-success' : 'table-warning' }
                      key={ task.id }>
            <td>{ task.filename }</td>
            <td>{ task.dataset_name }</td>
            <td>{ startDate.toLocaleDateString() }</td>
            <td>{ diffTime.toUTCString().split(' ')[4] }</td>
            <td>{ task.results_count }</td>
            <td>{ task.status }</td>
            <td><Link to={ `/audio-annotator/${ task.id }` }>Task link</Link></td>
          </tr>)
        }) }
        </tbody>
      </table>
    </div>
  )
}
