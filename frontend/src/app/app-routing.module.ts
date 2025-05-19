import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { ArtistDetailsComponent } from './components/artist-details/artist-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'artist/:id', component: ArtistDetailsComponent },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'favorites', 
    component: FavoritesComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/search' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }