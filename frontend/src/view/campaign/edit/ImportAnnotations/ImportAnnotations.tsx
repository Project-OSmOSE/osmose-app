import React, { useEffect } from "react";
import styles from '../edit.module.scss';
import { DetectorsContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsContent.tsx";
import { DetectorsConfigContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsConfigContent.tsx";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { FileSelector } from "@/view/campaign/edit/ImportAnnotations/file/Selector.tsx";
import { Upload } from "@/view/campaign/edit/ImportAnnotations/Upload.tsx";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { ImportAnnotationsSlice } from "@/service/slices/import-annotations.ts";

export const ImportAnnotations: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign();

  const { file, detectors, } = useAppSelector(state => state.resultImport)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(ImportAnnotationsSlice.actions.clear())
  }, []);

  return <div className={ [ styles.page, styles[file.state], detectors.selection.length > 0 ? styles.withConfig : '' ].join(' ') }>

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

