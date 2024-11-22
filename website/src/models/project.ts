import { TeamMember } from "./team";
import { Collaborator } from "./collaborator";

export interface Project {
    id: number;
    title: string;
    intro: string;
    body: string;
    start?: string;
    end?: string;
    thumbnail?: string;
    osmose_member_contacts?: Array<TeamMember>;
    other_contacts?: Array<string>;
    collaborators?: Array<Collaborator>;
}