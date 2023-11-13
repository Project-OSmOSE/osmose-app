import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export interface PaginationProps {
    totalCount: number,
    currentPage: number,
    pageSize: number
}

export const Pagination: React.FC<PaginationProps> = ({
    totalCount, // sum of all items
    currentPage,
    pageSize // items per page
}) => {
    const pages = [];
    const pageNb = Math.floor(totalCount/pageSize) + (totalCount%pageSize===0 ? 0 : 1);
    for (let i=1; i<=pageNb; i++){
        pages.push(String(i));
    }

    const liElems = pages.map(page => { 
        return(
            <li key={page} className={"page-item " + (String(currentPage)===page ? 'active' : '')}>
                <Link className="page-link" to={"/news/"+page}>{page}</Link>
            </li>
        );
    });

    return (
        <nav aria-label="Navigate the news">
            <ul className="pagination justify-content-center"> 
                {liElems}
            </ul>
        </nav>
    );
}
