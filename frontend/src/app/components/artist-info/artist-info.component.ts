import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Artist, SimilarArtist } from '../../models/artist.model';
import { ArtsyService } from '../../services/artsy.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
// New imports
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-artist-info',
  templateUrl: './artist-info.component.html',
  styleUrls: ['./artist-info.component.scss'],
  standalone: false
})
export class ArtistInfoComponent implements OnInit, OnChanges {
  @Input() artistId!: string;
  @Output() loaded = new EventEmitter<void>(); // 新增：加载完成事件

  artist: Artist | null = null;
  isLoadingArtist: boolean = false;
  similarArtists: SimilarArtist[] = [];
  isLoadingSimilar: boolean = false;
  isLoggedIn: boolean = false;

  // For destroying subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private artsyService: ArtsyService,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;

      if (this.artistId) {
        this.loadArtistDetails();
      }
    });

    // Subscribe to favorites changes
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.artist) {
          this.artist.isFavorite = this.favoritesService.isInFavorites(this.artist.id);
        }
        // Update similar artists
        this.similarArtists = this.similarArtists.map(artist => ({
          ...artist,
          isFavorite: this.favoritesService.isInFavorites(artist.id)
        }));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload similar artists when artist changes
    if (changes['artistId'] && !changes['artistId'].firstChange) {
      this.loadArtistDetails();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
    * 格式化艺术家传记文本，处理段落分隔和连字符
    */
  // formatBiography(biography: string): string {
  //   if (!biography) return '';

  //   // 移除连字符后跟空格的情况（如"Cub- ism"变为"Cubism"）
  //   let formattedText = biography.replace(/(\w+)- (\w+)/g, '$1$2').replace(/\u2013/g, "\u002D");

  //   return formattedText;
  // }

  /**
   * Load artist details
   */
  loadArtistDetails(): void {
    this.isLoadingArtist = true;

    this.artsyService.getArtistDetails(this.artistId)
      .subscribe({
        next: (artist) => {
          this.artist = artist;
          this.isLoadingArtist = false;

          // Load similar artists if user is logged in
          if (this.isLoggedIn) {
            this.artist.isFavorite = this.favoritesService.isInFavorites(this.artistId);
            this.loadSimilarArtists();
          }

          this.loaded.emit(); // Emit loaded event
        },
        error: (error) => {
          console.error('Error loading artist details:', error);
          this.isLoadingArtist = false;
          this.loaded.emit(); // Emit loaded event
        }
      });
  }

  /**
   * Load similar artists
   */
  loadSimilarArtists(): void {
    this.isLoadingSimilar = true;

    this.artsyService.getSimilarArtists(this.artistId)
      .subscribe({
        next: (artists) => {
          // Add isFavorite property to each artist
          this.similarArtists = artists.map(artist => ({
            ...artist,
            isFavorite: this.favoritesService.isInFavorites(artist.id)
          }));
          this.isLoadingSimilar = false;
        },
        error: (error) => {
          console.error('Error loading similar artists:', error);
          this.isLoadingSimilar = false;
        }
      });
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(artistId: string, event: Event): void {
    event.stopPropagation(); // 防止触发selectArtist

    if (this.isLoggedIn) {
      this.favoritesService.toggleFavorite(artistId).subscribe({
        // 不需要success回调，因为我们订阅了favorites$
        error: (error) => {
          console.error('Error toggling favorite status:', error);
        }
      });
    }
  }
  // toggleFavorite(artistId: string, event: Event): void {
  //   event.stopPropagation(); // Prevent card click

  //   if (this.isLoggedIn) {
  //     this.favoritesService.toggleFavorite(artistId).subscribe(() => {
  //       // Update UI state
  //       if (this.artist && this.artist.id === artistId) {
  //         this.artist.isFavorite = !this.artist.isFavorite;
  //       }

  //       // Update similar artists
  //       this.similarArtists = this.similarArtists.map(artist => {
  //         if (artist.id === artistId) {
  //           return { ...artist, isFavorite: !artist.isFavorite };
  //         }
  //         return artist;
  //       });
  //     });
  //   }
  // }

  /**
   * Select similar artist and navigate to artist details
   */
  selectSimilarArtist(artist: SimilarArtist, event: Event): void {
    event.preventDefault();

    // Prevent clicking on favorite button from navigating
    if ((event.target as HTMLElement).closest('.favorite-btn')) {
      return;
    }

    this.router.navigate(['/artist', artist.id]);
  }

  /**
   * Navigate to artist details
   */
  navigateToArtistDetails(): void {
    if (this.artist) {
      this.router.navigate(['/artist', this.artist.id]);
    }
  }
}
