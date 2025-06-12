import React, { KeyboardEvent, useCallback } from "react";
import { IonSearchbar } from "@ionic/react";

export const Searchbar: React.FC<{
  search?: string;
  onChange(search?: string): void;
  placeholder?: string;
  className?: string;
}> = ({ search, onChange, placeholder, className }) => {

  const doSearch = useCallback((event: KeyboardEvent<HTMLIonSearchbarElement>) => {
    if (event.key === 'Enter') {
      const search = event.currentTarget.value?.trim()
      if (search && search.length > 0)
        onChange(search)
      else onChange(undefined)
    }
  }, [ onChange ])

  const clearSearch = useCallback(() => {
    onChange(undefined)
  }, [ onChange ])

  return <IonSearchbar placeholder={ placeholder }
                       className={ className }
                       onKeyDown={ doSearch }
                       onIonClear={ clearSearch }
                       value={ search }/>
}