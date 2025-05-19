import React, { CSSProperties, HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { IonItem, IonList, IonSearchbar } from "@ionic/react";
import { Item } from "@/types/item.ts";
import { searchFilter } from "@/services/utils/search.ts";
import { createPortal } from "react-dom";
import styles from './searchbar.module.scss';

interface Props {
  values: Array<Item>;
  onValueSelected?: (value: Item) => void;
  placeholder: string;
}

export const Searchbar: React.FC<Props & HTMLAttributes<HTMLIonSearchbarElement>> = (props) => {
  const searchbarRef = useRef<HTMLIonSearchbarElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [ search, setSearch ] = useState<string>();
  const [ searchResult, setSearchResult ] = useState<Array<any>>([]);

  useEffect(() => setSearchResult(searchFilter(props.values, search)), [ search ])

  const listPosition: CSSProperties = useMemo(() => {
    let top = 0, left = 0, width = 0;
    if (containerRef.current) {
      top = containerRef.current.offsetTop + containerRef.current.offsetHeight + 8;

      const bounds = containerRef.current.getBoundingClientRect()
      top = document.getElementsByTagName('html')[0].scrollTop + bounds.top + bounds.height;
      left = bounds.left;
      width = bounds.width;
    }
    return {
      position: 'absolute', top, left, width,
      transition: 'opacity 150ms ease-in-out',
    }
  }, [ containerRef.current?.getBoundingClientRect() ]);

  return (
    <div ref={ containerRef }
         className={ [ styles.searchbar, !search ? '' : styles.withResults ].join(' ') }>
      <IonSearchbar { ...props }
                    ref={ searchbarRef }
                    value={ search }
                    onIonInput={ e => setSearch(e.detail.value ?? undefined) }></IonSearchbar>

      { !!search && createPortal(<IonList id="searchbar-results"
                                          className={ styles.results }
                                          lines="none"
                                          style={ listPosition }>
        { (searchResult.length > 5 ? searchResult.slice(0, 4) : searchResult.slice(0, 5)).map((v, i) => (
          <IonItem key={ i } onClick={ () => {
            setSearch(undefined);
            if (props.onValueSelected) props.onValueSelected(v)
          } }>{ v.label }</IonItem>
        )) }
        { searchResult.length > 5 && <IonItem className="none">{ searchResult.length - 4 } more results</IonItem> }
        { searchResult.length === 0 && <IonItem className="none">No results</IonItem> }
      </IonList>, document.body) }

    </div>
  )
}
