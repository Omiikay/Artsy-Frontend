import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArtsyService } from '../../services/artsy.service';
import { ArtistSearchResult, Artist } from '../../models/artist.model';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
// New imports
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: false
})
export class SearchComponent implements OnInit {
    searchQuery: string = '';
    initSearch: boolean = true; // 是否初始化搜索
    isSearching: boolean = false; // 是否正在搜索详情
    isSearchingArtist: boolean = false; // 是否正在搜索艺术家
    searchResults: ArtistSearchResult[] = [];
    selectedArtist: Artist | null = null;
    isLoadingArtist: boolean = false;
    isLoggedIn: boolean = false;
    isLoadingTab: boolean = false; // 是否正在加载tab内容
    activeTab: 'info' | 'artworks' = 'info';

    // For destroying subscriptions
    private destroy$ = new Subject<void>();

    constructor(
        private artsyService: ArtsyService,
        private favoritesService: FavoritesService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check if user is logged in
        this.authService.isLoggedIn$.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;

            // Load favorites if logged in
            if (isLoggedIn) {
                this.favoritesService.loadFavorites().subscribe();
            }
        });

        // Check for artistId in URL and load if present
        const url = this.router.url;
        const artistIdMatch = url.match(/\/search\?artistId=([^&]+)/);
        if (artistIdMatch && artistIdMatch[1]) {
            this.loadArtistDetails(artistIdMatch[1]);
        }

        // Subscribe to favorites changes
        this.favoritesService.favorites$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                // Update search results with favorite status
                this.searchResults = this.searchResults.map(artist => ({
                    ...artist,
                    isFavorite: this.favoritesService.isInFavorites(artist.id)
                }));
                // Update selected artist if it exists
                if (this.selectedArtist) {
                    this.selectedArtist.isFavorite = this.favoritesService.isInFavorites(this.selectedArtist.id);
                }
            });
    }

    /**
     * Clean up subscriptions
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Search for artists
     */
    search(): void {
        if (!this.searchQuery.trim()) {
            return;
        }

        // this.searchResults = [];
        // this.selectedArtist = null;
        // this.isLoadingArtist = true;
        // this.isSearching = true;
        this.isSearchingArtist = true;
        this.initSearch = true;

        this.artsyService.searchArtists(this.searchQuery)
            .subscribe({
                next: (results) => {
                    // 如果用户已登录，更新每个艺术家的收藏状态
                    if (this.isLoggedIn) {
                        this.searchResults = results.map(artist => ({
                            ...artist,
                            isFavorite: this.favoritesService.isInFavorites(artist.id)
                        }));
                    } else {
                        this.searchResults = results;
                    }
                    this.initSearch = false;
                    this.isSearching = false;
                    this.isSearchingArtist = false;

                    console.log('Search results:', this.searchResults);
                },
                error: (error) => {
                    console.error('Error searching artists:', error);
                    this.isSearching = false;
                    this.isSearchingArtist = false;
                }
            });
    }

    /**
     * Clear search results and selected artist
     */
    clear(): void {
        this.searchQuery = '';
        this.searchResults = [];
        this.selectedArtist = null;
        this.activeTab = 'info';
        this.initSearch = true;
    }

    /**
     * Load artist details
     */
    loadArtistDetails(artistId: string): void {
        console.log('Loading artist details for ID:', artistId);
        // If artistId is already selected, do nothing
        if (this.selectedArtist && this.selectedArtist.id === artistId) {
            console.log('Artist already selected:', this.selectedArtist);
            return;
        }
        this.artsyService.getArtistDetails(artistId)
            .subscribe({
                next: (artist) => {
                    this.selectedArtist = artist;
                    this.isLoadingArtist = false;
                    this.isLoadingTab = true;

                    // Update URL to include artistId
                    this.router.navigate(['/search'], {
                        queryParams: { artistId: artistId },
                        replaceUrl: true
                    });

                    // If user is logged in, check if this artist is in favorites
                    if (this.isLoggedIn) {
                        this.selectedArtist.isFavorite = this.favoritesService.isInFavorites(artistId);
                    }

                    console.log('Loaded artist details:', this.selectedArtist);
                },
                error: (error) => {
                    console.error('Error loading artist details:', error);
                    this.isLoadingArtist = false;
                }
            });
    }

    /**
     * Select artist from search results
     */
    selectArtist(artist: ArtistSearchResult): void {
        console.log('Selected artist:', artist);

        if (!artist.id) {
            console.error('Artist ID is undefined!');
            return;
        }

        this.loadArtistDetails(artist.id);
    }

    /**
     * Toggle favorite status of the selected artist
     */
    toggleFavorite(artistId: string, event: Event): void {
        event.stopPropagation(); // prevent triggering selectArtist
      
        if (this.isLoggedIn) {
          this.favoritesService.toggleFavorite(artistId).subscribe({
            // No need success callback, as we subscribe to favorites$
            error: (error) => {
              console.error('Error toggling favorite status:', error);
            }
          });
        }
      }
    // toggleFavorite(artistId: string, event: Event): void {
    //     event.stopPropagation(); // 防止触发selectArtist

    //     if (this.isLoggedIn) {
    //         this.favoritesService.toggleFavorite(artistId).subscribe(() => {
    //             // Update UI state after toggling
    //             if (this.selectedArtist && this.selectedArtist.id === artistId) {
    //                 this.selectedArtist.isFavorite = !this.selectedArtist.isFavorite;
    //             }

    //             // Update artist in search results
    //             this.searchResults = this.searchResults.map(artist => {
    //                 if (artist.id === artistId) {
    //                     return {
    //                         ...artist,
    //                         isFavorite: !artist.isFavorite
    //                     };
    //                 }
    //                 return artist;
    //             });
    //         });
    //     }
    // }

    /**
     * Switch between artist info and artworks tabs
     */
    switchTab2(tab: 'info' | 'artworks'): void {
        this.activeTab = tab;
    }


    switchTab(tab: 'info' | 'artworks'): void {
        if (this.activeTab !== tab) {
            this.activeTab = tab;
            this.isLoadingTab = true; // 切换tab时设置加载状态

            // 设置超时以防止加载卡住
            setTimeout(() => {
                this.isLoadingTab = false;
            }, 5000); // 5秒超时
        }
    }

    /**
     * Callback when content is loaded
     */
    onContentLoaded(): void {
        this.isLoadingTab = false;
    }

}
