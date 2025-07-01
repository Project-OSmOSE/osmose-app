import { Scientist } from "./scientific";

export type PublicationStatus = 'Upcoming' | 'Published';
export type PublicationType = 'Software' | 'Article' | 'Conference' | 'Poster';

type BibliographyStatus = {
    publication_status: 'Upcoming';
} | {
    publication_status: 'Published';
    publication_date: string; // Date
}
type BaseBibliography = {
    id: string;
    title: string;
    doi: string;
    tags: string[];
    authors: Author[];
} & BibliographyStatus
export type ArticleBibliography = BaseBibliography & {
    type: 'Article';
    journal: string;
    volumes: string;
    pages_from: number | null;
    pages_to: number | null;
    issue_nb: number | null;
    article_nb: number | null;
}
export type SoftwareBibliography = BaseBibliography & {
    type: 'Software';
    publication_place: string;
    repository_url: string | null; // URL
}
export type ConferenceBibliography = BaseBibliography & {
    type: 'Conference';
    conference: string;
    conference_location: string;
    conference_abstract_book_url: string | null; // URL
}
export type PosterBibliography = BaseBibliography & {
    type: 'Poster';
    conference: string;
    conference_location: string;
    conference_abstract_book_url: string | null; // URL
    poster_url: string | null; // URL
}
export type Bibliography = ArticleBibliography | SoftwareBibliography | ConferenceBibliography | PosterBibliography;

export interface Author {
    id: string;
    order: number;
    scientist: Scientist;
    institutions: any[];
}