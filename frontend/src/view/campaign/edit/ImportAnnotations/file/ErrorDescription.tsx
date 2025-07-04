import React, { Fragment } from "react";
import { useAppSelector } from "@/service/app.ts";
import { getErrorMessage } from "@/service/function.ts";
import { ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import styles from "@/view/campaign/edit/edit.module.scss";
import { WarningText } from "@/components/ui";

export const FileErrorDescription: React.FC = () => {
  const { file } = useAppSelector(state => state.resultImport)

  if (file.state !== 'error') return <Fragment/>;
  return <Fragment>
    <WarningText><p>Unrecognized file.<br/>{ getErrorMessage(file.error) }</p></WarningText>

    <p>The file should have the following columns: { IMPORT_ANNOTATIONS_COLUMNS.required.map(c => (
      <Fragment key={ c }><b>{ c }</b><span className={ styles.separator }>, </span></Fragment>)) }</p>

    <p>The file can have additional optional columns: { IMPORT_ANNOTATIONS_COLUMNS.optional.map(c => (
      <Fragment key={ c }><b>{ c }</b><span className={ styles.separator }>, </span></Fragment>)) }</p>

    <p>The accepted separator is: <b>{ ACCEPT_CSV_SEPARATOR }</b></p>
  </Fragment>
}