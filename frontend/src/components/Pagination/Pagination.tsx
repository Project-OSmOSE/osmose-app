import React, { useMemo } from 'react';
import { IonButton } from '@ionic/react';
import styles from './Pagination.module.scss';

export const Pagination: React.FC<{
  currentPage: number,
  totalPages: number,
  setCurrentPage: (page: number) => void,
}> = ({ currentPage, totalPages, setCurrentPage }) => {

  const showPages = useMemo(() => {
    const pages = [ currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2 ].filter(i => i > 1 && i < totalPages);

    const show: Array<number | '...'> = [ 1 ];
    if (!pages.includes(2)) show.push('...')
    show.push(...pages);
    if (!pages.includes(totalPages - 1)) show.push('...');
    show.push(totalPages);
    return show;
  }, [ currentPage, totalPages ]);

  if (totalPages === 1) return;

  return <div className={ styles.buttons }>
    { showPages.map((i) => {
      if (i === '...') return <p>...</p>
      return <IonButton fill={ i === currentPage ? 'solid' : 'outline' }
                        onClick={ () => setCurrentPage(i) }>
        { i }
      </IonButton>
    }) }
  </div>
}