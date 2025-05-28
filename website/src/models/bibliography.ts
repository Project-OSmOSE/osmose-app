import { Scientist } from "./scientific";
import { Institution } from "@pam-standardization/metadatax-ts";

export type PublicationStatus = 'Draft' | 'In Review' | 'Published';
export type PublicationType = 'Software' | 'Article' | 'Conference';

type BibliographyStatus = {
    publication_status: 'Draft' | 'In Review';
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
}
export type Bibliography = ArticleBibliography | SoftwareBibliography | ConferenceBibliography;

export interface Author {
    id: string;
    order: number;
    scientist: Scientist;
    institutions: Institution[];
}