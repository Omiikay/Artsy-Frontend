import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})

export class AppComponent implements OnInit {
  title = 'Artist Search';

  // For test use only
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check authentication status on app initialization
    this.authService.checkAuthStatus();
  }
}