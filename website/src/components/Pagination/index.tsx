import React from 'react';
import { IonButton } from "@ionic/react";

import './styles.css';

export interface PaginationProps {
    /** sum of all items */
    totalCount: number,
    currentPage: number,
    /** items per page */
    pageSize: number,
    path: string
}

export const Pagination: React.FC<PaginationProps> = ({ totalCount, currentPage, pageSize, path }) => {
    const pages: Array<number> = [];

    const pageNb = Math.floor(totalCount / pageSize) + (totalCount % pageSize === 0 ? 0 : 1);
    for (let i = 1; i <= pageNb; i++) {
        pages.push(i);
    }

    return (
        <div id="pagination">
            { pages.map(page => (
                <IonButton key={ page }
                           fill={ currentPage === page ? 'solid' : 'clear' }
                           href={ `${ path }/${ page }` }>{ page }</IonButton>
            )) }
        </div>
    );
}
