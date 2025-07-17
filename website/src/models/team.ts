import { Contact } from "./bibliography";

export interface TeamMember {
  id: string;
  contact: Contact;
  position: string;
  biography?: string;
  picture: string;

  mail_address?: string;

  research_gate_url?: string;
  personal_website_url?: string;
  github_url?: string;
  linkedin_url?: string;

  is_former_member?: boolean;
}
