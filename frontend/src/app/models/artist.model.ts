export interface ArtistSearchResult {
    id: string;
    title: string;
    _links: {
        self: {
            href: string;
        };
        thumbnail: {
            href: string;
        };
    };
    imageUrl: string;
    isFavorite?: boolean;
}

export interface Artist {
    id: string;
    name: string;
    birthday: string;
    deathday: string;
    nationality: string;
    biography: string;
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
    imageUrl: string;
    isFavorite?: boolean;
}

export interface SimilarArtist {
    id: string;
    name: string;
    birthday: string;
    deathday: string;
    nationality: string;
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
    imageUrl: string;
    isFavorite?: boolean;
}
