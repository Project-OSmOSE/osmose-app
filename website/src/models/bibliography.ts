import { TeamMember } from "./team";

export type PublicationStatus = 'Upcoming' | 'Published';
export type PublicationType = 'Software' | 'Article' | 'Conference' | 'Poster';

type BibliographyStatus = {
  status: 'Upcoming';
} | {
  status: 'Published';
  publication_date: string; // Date
}
export type Bibliography = {
  id: string;
  title: string;
  doi: string;
  tags: string[];
  authors: Author[];
} & BibliographyStatus & (
  { type: 'Article'; article_information: ArticleInformation; } |
  { type: 'Software'; software_information: SoftwareInformation; } |
  { type: 'Conference'; conference_information: ConferenceInformation; } |
  { type: 'Poster'; poster_information: PosterInformation; conference_information?: ConferenceInformation; }
  )

export type ArticleInformation = {
  journal: string;
  volumes: string | null;
  pages_from: number | null;
  pages_to: number | null;
  issue_nb: number | null;
  article_nb: number | null;
}
export type SoftwareInformation = {
  publication_place: string;
  repository_url: string | null; // URL
}
export type ConferenceInformation = {
  conference: string;
  conference_location: string;
  conference_abstract_book_url: string | null; // URL
}
export type PosterInformation = {
  poster_url: string | null; // URL
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  initial_names: string;
  mail: string | null;
  website: string | null;
  current_institutions: number[]; //pk
  team_member: TeamMember | null;
}

export interface Institution {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface Author {
  id: string;
  order: number;
  contact: Contact;
  institutions: Institution[];
}