import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/service/ui";
import { CampaignAPI } from "@/service/campaign";
import styles from '../edit.module.scss';
import { DetectorsContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsContent.tsx";
import { DetectorsConfigContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsConfigContent.tsx";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { ResultImportSlice } from "@/service/campaign/result/import";
import { FileSelector } from "@/view/campaign/edit/ImportAnnotations/file/Selector.tsx";
import { Upload } from "@/view/campaign/edit/ImportAnnotations/Upload.tsx";

export const ImportAnnotations: React.FC = () => {
  const location = useLocation();
  const toast = useToast();
  const { data: campaign } = CampaignAPI.useRetrieveQuery();

  const { file, detectors, } = useAppSelector(state => state.resultImport)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(ResultImportSlice.actions.clear())
  }, []);

  // Navigation
  const page = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!campaign || !(location.state as any)?.fromCreateCampaign) return;
    toast.presentSuccess(`Campaign '${ campaign.name }' was successfully created`)
  }, [ location, campaign ]);

  return <div
    className={ [ styles.page, styles[file.state], detectors.selection.length > 0 ? styles.withConfig : '' ].join(' ') }
    ref={ page }>

    <div className={ styles.title }>
      <h2>Import annotations</h2>
      { campaign && <h5>{ campaign.name }</h5> }
    </div>

    <FileSelector/>
    <DetectorsContent/>
    <DetectorsConfigContent/>

    <Upload/>
  </div>
}

