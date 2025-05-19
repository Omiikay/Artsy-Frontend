import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  isDropdownOpen = false;
  isLoggedIn$: Observable<boolean>;
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdown = document.querySelector('.dropdown-menu');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (dropdown && dropdownToggle) {
      if (!dropdown.contains(event.target as Node) && 
          !dropdownToggle.contains(event.target as Node)) {
        this.isDropdownOpen = false;
      }
    }
  }

  // Close dropdown when pressing ESC key
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.isDropdownOpen = false;
  }

  deleteAccount(): void {
    // if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    //   this.authService.deleteAccount().subscribe();
    // }
    this.authService.deleteAccount().subscribe();
    this.isDropdownOpen = false;
  }
}
