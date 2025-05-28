export interface Institution {
    id: string;
    name: string;
    city: string;
    country: string;
}

export interface Scientist {
    id: string;
    first_name: string;
    last_name: string;
    institutions: Institution[];

    full_name: string; // ex: John Doe
    short_name: string; // ex: Doe, J.
}