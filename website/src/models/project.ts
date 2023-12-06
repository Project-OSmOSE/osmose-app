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
    contact?: Array<TeamMember>;
    collaborators?: Array<Collaborator>;
}