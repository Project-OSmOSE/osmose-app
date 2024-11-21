import { TeamMember } from "./team";

export interface ScientificTalk {
    id: number;
    title: string;
    date: string;
    intro: string;
    thumbnail?: string;
    osmose_member_presenters?: Array<TeamMember>;
    other_presenters?: Array<string>;
}
