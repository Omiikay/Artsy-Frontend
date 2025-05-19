import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-artist-details',
  templateUrl: './artist-details.component.html',
  styleUrls: ['./artist-details.component.scss'],
  standalone: false
})
export class ArtistDetailsComponent implements OnInit {
  artistId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Get artist ID from route params
    this.route.params.subscribe(params => {
      this.artistId = params['id'];
      if (!this.artistId) {
        this.router.navigate(['/search']);
      } else {
        // Update URL to include artistId
        this.router.navigate(['/search'], {
          queryParams: { artistId: this.artistId },
          replaceUrl: true
      });
      }
    });
  }
}
