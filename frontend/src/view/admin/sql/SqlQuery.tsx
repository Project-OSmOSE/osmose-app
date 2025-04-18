import React, { Fragment, useCallback, useEffect, useRef } from "react";
import { UserAPI } from "@/service/user";
import { basicSetup, EditorView } from "codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { SqlAPI } from "@/service/sql";
import { Button, Kbd } from "@/components/ui";
import { Prec } from "@codemirror/state";
import { WarningMessage } from "@/components/warning/warning-message.component.tsx";
import { getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import styles from './sql.module.scss'
import { Pagination } from "@/components/Pagination/Pagination.tsx";
import { AploseSkeleton } from "@/components/layout";


export const SqlQuery: React.FC = () => {
  const { data: user } = UserAPI.useGetCurrentUserQuery();
  const { data: schema } = SqlAPI.useSchemaQuery();
  const [ run, { data: results, error } ] = SqlAPI.usePostMutation();

  const editorContainerRef = useRef<HTMLDivElement | undefined>();
  const editorRef = useRef<EditorView | undefined>();
  const pageRef = useRef<number>(1);

  useEffect(() => {
    setupEditor()
  }, [ schema ]);

  const setupEditor = useCallback(() => {
    if (!editorContainerRef.current) return;
    if (!schema) return;
    if (editorRef.current) return;
    editorRef.current = new EditorView({
      doc: '-- SELECT entries from APLOSE\n',
      extensions: [
        basicSetup,
        sql({
          dialect: PostgreSQL,
          upperCaseKeywords: true,
          schema

        }),
        keymap.of([ ...defaultKeymap, indentWithTab ]),
        Prec.highest(keymap.of([ {
          key: "Ctrl-Enter",
          run: () => {
            runQuery(1)
            return true;
          }
        } ])),
      ],
      parent: editorContainerRef.current,
    })
  }, [ schema ])

  const runQuery = useCallback((page: number) => {
    pageRef.current = page;
    const query = editorRef.current?.state.doc.toString()
    if (query) run({ query, page });
  }, [])

  const download = useCallback(() => {
    if (!results) return;

    const csvFile = new Blob([
      [ results.columns.join(','),
        ...results.results.map(r => r.join(',')) ].join('\n')
    ], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "results.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }, [ results ])

  if (!user || !user.is_superuser) return <Fragment/>
  return <AploseSkeleton>
    <div className={ styles.page }>

      <h2>SQL Query</h2>

      <div className={ styles.sql }
           ref={ ref => {
             if (!ref || editorRef.current) return;
             editorContainerRef.current = ref;
             setupEditor();
           } }/>

      <Button fill="outline" className={ styles.run } onClick={ () => runQuery(1) }>Run query &nbsp; <Kbd
        keys={ [ 'ctrl', 'enter' ] }/></Button>

      <Button fill="outline" className={ styles.download }
              onClick={ download } disabled={ !results }>Download</Button>

      { error && <WarningMessage className={ styles.error }>{ getErrorMessage(error) }</WarningMessage> }

      { results && <Table className={ styles.results } columns={ results.columns.length }>
        { results.columns.map((c, i) => <TableHead topSticky leftSticky={ i === 0 }
                                                   isFirstColumn={ i === 0 }
                                                   key={ c }>{ c }</TableHead>) }
        { results.results.map((row, k) => <Fragment key={ k }>
          <TableDivider/>
          { row.map((cell, i) => <TableContent leftSticky={ i === 0 } isFirstColumn={ i === 0 }
                                               key={ i }>{ cell }</TableContent>) }
        </Fragment>) }
      </Table> }

      { results &&
          <Pagination className={ styles.pagination } currentPage={ pageRef.current } totalPages={ results.pageCount }
                      setCurrentPage={ runQuery }/> }
    </div>
  </AploseSkeleton>
}