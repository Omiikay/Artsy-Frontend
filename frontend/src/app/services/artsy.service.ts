import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArtistSearchResult, Artist, SimilarArtist } from '../models/artist.model';
import { Artwork, Category } from '../models/artwork.model';

@Injectable({
    providedIn: 'root'
})
export class ArtsyService {
    private apiUrl = '/api/artsy';

    constructor(private http: HttpClient) { }

    /**
     * Search for artists by name
     */
    searchArtists(query: string): Observable<ArtistSearchResult[]> {
        return this.http.get<{ results: ArtistSearchResult[] }>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
            .pipe(
                map(response => response.results)
            );
    }

    /**
     * Get artist details by ID
     */
    getArtistDetails(artistId: string): Observable<Artist> {
        return this.http.get<{ artist: Artist }>(`${this.apiUrl}/artists/${artistId}`)
            .pipe(
                map(response => response.artist)
            );
    }

    /**
     * Get similar artists
     */
    getSimilarArtists(artistId: string): Observable<SimilarArtist[]> {
        return this.http.get<{ similarArtists: SimilarArtist[] }>(`${this.apiUrl}/artists/${artistId}/similar`)
            .pipe(
                map(response => response.similarArtists)
            );
    }

    /**
     * Get artworks by artist ID
     */
    getArtworksByArtist(artistId: string): Observable<Artwork[]> {
        return this.http.get<{ artworks: Artwork[] }>(`${this.apiUrl}/artists/${artistId}/artworks`)
            .pipe(
                map(response => response.artworks)
            );
    }

    /**
     * Get artwork categories
     */
    getArtworkCategories(artworkId: string): Observable<Category[]> {
        return this.http.get<{ categories: Category[] }>(`${this.apiUrl}/artworks/${artworkId}/categories`)
            .pipe(
                map(response => response.categories)
            );
    }
}
