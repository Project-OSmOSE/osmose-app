import React, { ChangeEvent, Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { Input } from "@/components/form";
import styles from '../Detail.module.scss'

export const DateFilter: React.FC<{
  onUpdate: () => void
}> = ({ onUpdate }) => {
  const { id: campaignID } = useParams<{ id: string }>();

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  const minDate: string = useMemo(() => {
    if (!filters.minDate) return '';
    const date = filters.minDate.split('');
    date.pop();
    return date.join('');
  }, [ filters ]);

  const maxDate: string = useMemo(() => {
    if (!filters.maxDate) return '';
    const date = filters.maxDate.split('');
    date.pop();
    return date.join('');
  }, [ filters ]);


  function getDateString(event: ChangeEvent<HTMLInputElement>): string | undefined {
    const value = event.currentTarget.value;
    if (!value) return undefined;
    const date = new Date(value);
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    )).toISOString()
  }

  function setMin(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      minDate: getDateString(event),
    }))
    onUpdate()
  }

  function setMax(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      maxDate: getDateString(event),
    }))
    onUpdate()
  }


  return <Fragment>
    <div><Input label="Minimum date" type="datetime-local" placeholder="Min date" step="1"
             value={ minDate } onChange={ setMin }/></div>

    <div className={ styles.dateFilter }><Input label="Maximum date" type="datetime-local" placeholder="Max date" step="1"
             value={ maxDate } onChange={ setMax }/></div>
  </Fragment>
}