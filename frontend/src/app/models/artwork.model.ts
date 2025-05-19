export interface Artwork {
    id: string;
    title: string;
    date: string;
    _links: {
        thumbnail: {
            href: string;
        };
        self: {
            href: string;
        };
        permalink: {
            href: string;
        };
    };
    imageUrl?: string; // Normalized property
}
  
export interface Category {
    id: string;
    name: string;
    _links: {
        thumbnail: {
            href: string;
        };
        self: {
            href: string;
        };
        permalink: {
            href: string;
        };
    };
    imageUrl?: string; // Normalized property
}