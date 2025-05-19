import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import { IonItem, IonList, IonSearchbar } from "@ionic/react";
import { Item } from "@/types/item.ts";
import { searchFilter } from "@/services/utils/search.ts";
import { createPortal } from "react-dom";
import styles from './searchbar.module.scss';
import { usePopover } from "@/service/ui/popover.ts";

interface Props {
  values: Array<Item>;
  onValueSelected?: (value: Item) => void;
  placeholder: string;
}

export const Searchbar: React.FC<Props & HTMLAttributes<HTMLIonSearchbarElement>> = (props) => {
  const { containerRef, top, left, width } = usePopover()

  const searchbarRef = useRef<HTMLIonSearchbarElement | null>(null);

  const [ search, setSearch ] = useState<string>();
  const [ searchResult, setSearchResult ] = useState<Array<any>>([]);

  useEffect(() => setSearchResult(searchFilter(props.values, search)), [ search ])

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
                                          style={ { top, left, width } }>
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
