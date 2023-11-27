export interface TeamMember {
    id: string;

    name: string;
    position: string;
    biography: string;
    picture: string;

    mailAddress: string;

    researchGateURL?: string;
    personalWebsiteURL?: string;
    githubURL?: string;
    linkedinURL?: string;

    isFormerMember?: boolean;
}