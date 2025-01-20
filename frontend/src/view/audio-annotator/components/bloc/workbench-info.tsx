import React, { Fragment, useMemo } from "react";
import { useAppSelector } from '@/service/app';
import { useParams } from "react-router-dom";
import { useRetrieveCampaignQuery } from "@/service/campaign";

export const WorkbenchInfoBloc: React.FC = () => {
  const { campaignID } = useParams<{ campaignID: string, fileID: string }>();
  const { data: campaign } = useRetrieveCampaignQuery(campaignID)

  const file = useAppSelector(state => state.annotator.file);

  const filename = useMemo(() => {
    if (!file) return '';
    return decodeURI(file.audio_url).split('\\').pop()?.split('/').pop() ?? ''
  }, [ file?.audio_url ])

  if (!campaign || !file) return <Fragment/>
  return <p className="workbench-info workbench-info--intro">
    Campaign: <strong>{ campaign.name }</strong>
    <br/>
    File: <strong>{ filename }</strong> -
    Sampling: <strong>{ file.dataset_sr } Hz</strong>
    <br/>
    Start date: <strong>{ new Date(file.start).toUTCString() }</strong>
  </p>
}