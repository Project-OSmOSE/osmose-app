import { TeamMember } from "./team";

export interface News {
    id: number;
    title: string;
    intro: string;
    body: string;
    date?: string;
    thumbnail?: string;
    osmose_member_authors?: Array<TeamMember>;
    other_authors?: Array<string>;
}
