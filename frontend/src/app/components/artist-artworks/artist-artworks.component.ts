import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { Artwork, Category } from '../../models/artwork.model';
import { ArtsyService } from '../../services/artsy.service';

@Component({
  selector: 'app-artist-artworks',
  templateUrl: './artist-artworks.component.html',
  styleUrls: ['./artist-artworks.component.scss'],
  standalone: false
})
export class ArtistArtworksComponent implements OnInit, OnChanges {
  @Input() artistId!: string;
  @Output() loaded = new EventEmitter<void>(); // 新增：加载完成事件

  artworks: Artwork[] = [];
  isLoading: boolean = false;
  selectedArtwork: Artwork | null = null;
  categories: Category[] = [];
  isLoadingCategories: boolean = false;
  showModal: boolean = false;

  constructor(private artsyService: ArtsyService) { }

  ngOnInit(): void {
    if (this.artistId) {
      this.loadArtworks();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['artistId'] && !changes['artistId'].firstChange) {
      this.loadArtworks();
    }
  }

  /**
   * Load artworks for artist
   */
  loadArtworks(): void {
    this.isLoading = true;

    this.artsyService.getArtworksByArtist(this.artistId)
      .subscribe({
        next: (artworks) => {
          this.artworks = artworks;
          this.isLoading = false;
          this.loaded.emit(); // 通知父组件加载完成
        },
        error: (error) => {
          console.error('Error loading artworks:', error);
          this.isLoading = false;
          this.loaded.emit(); // 通知父组件加载完成
        }
      });
  }

  /**
   * Open categories modal
   */
  openCategoriesModal(artwork: Artwork): void {
    this.selectedArtwork = artwork;
    this.categories = [];
    this.isLoadingCategories = true;
    this.showModal = true;

    this.artsyService.getArtworkCategories(artwork.id)
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.isLoadingCategories = false;
        }
      });
  }

  /**
   * Close categories modal
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedArtwork = null;
  }

  /**
   * Close modal when clicking outside
   */
  onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
