import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import { IonItem, IonList, IonSearchbar } from "@ionic/react";
import './searchbar.component.css';

interface Props {
  values: Array<any & { id: number }>;
  show: (value: any) => string;
  onValueSelected: (value: any) => void;
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
        const valueData = props.show(value).split(' ').filter(v => v).map(v => v.toLowerCase());
        for (const s of searchData) {
          if (valueData.find(v => v.includes(s))) continue;
          return false;
        }
        return true;
      })
        .sort((a, b) => {
          const aShow = props.show(a).toLowerCase();
          const bShow = props.show(b).toLowerCase();
          if (aShow.indexOf(search.toLowerCase()) > bShow.indexOf(search.toLowerCase())) {
            return 1;
          } else if (aShow.indexOf(search.toLowerCase()) < bShow.indexOf(search.toLowerCase())) {
            return -1;
          }
          return props.show(a).localeCompare(props.show(b))
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
          } }>{ props.show(v) }</IonItem>
        )) }
        { searchResult.length > 5 && <IonItem className="none">{ searchResult.length - 4 } more results</IonItem> }
        { searchResult.length === 0 && <IonItem className="none">No results</IonItem> }
      </IonList> }

    </div>
  )
}
