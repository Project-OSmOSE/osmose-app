import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import { IonItem, IonList, IonSearchbar } from "@ionic/react";
import { Item } from "@/types/item.ts";
import './searchbar.component.css';

interface Props {
  values: Array<Item>;
  onValueSelected: (value: Item) => void;
}

export const Searchbar: React.FC<Props & HTMLAttributes<HTMLIonSearchbarElement>> = (props) => {
  const searchbarRef = useRef<HTMLIonSearchbarElement | null>(null);

  const [search, setSearch] = useState<string | null>();
  const [searchResult, setSearchResult] = useState<Array<any>>([]);

  useEffect(() => {
    if (!search) return setSearchResult([]);
    const searchData = search.split(' ').filter(s => s).map(s => s.toLowerCase());
    setSearchResult(
      props.values.filter(value => {
        const valueData = value.label.split(' ').filter(v => v).map(v => v.toLowerCase());
        return searchData.every(s => valueData.find(v => v.includes(s)))
      })
        .sort((a, b) => {
          const aShow = a.label.toLowerCase();
          const bShow = b.label.toLowerCase();
          if (aShow.indexOf(search.toLowerCase()) > bShow.indexOf(search.toLowerCase())) {
            return 1;
          } else if (aShow.indexOf(search.toLowerCase()) < bShow.indexOf(search.toLowerCase())) {
            return -1;
          }
          return a.label.localeCompare(b.label)
        })

    );
  }, [search])

  return (
    <div id="searchbar" className={ !search ? '' : 'got-results' }>
      <IonSearchbar { ...props }
                    ref={ searchbarRef }
                    value={ search }
                    onIonInput={ e => setSearch(e.detail.value) }></IonSearchbar>

      { !!search && <IonList id="searchbar-results" lines="none">
        { (searchResult.length > 5 ? searchResult.slice(0, 4) : searchResult.slice(0, 5)).map((v, i) => (
          <IonItem key={ i } onClick={ () => {
            setSearch(null);
            props.onValueSelected(v)
          } }>{ v.label }</IonItem>
        )) }
        { searchResult.length > 5 && <IonItem className="none">{ searchResult.length - 4 } more results</IonItem> }
        { searchResult.length === 0 && <IonItem className="none">No results</IonItem> }
      </IonList> }

    </div>
  )
}
