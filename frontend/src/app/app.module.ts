import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './components/search/search.component';
import { ArtistDetailsComponent } from './components/artist-details/artist-details.component';
import { ArtistInfoComponent } from './components/artist-info/artist-info.component';
import { ArtistArtworksComponent } from './components/artist-artworks/artist-artworks.component';
import { NotificationComponent } from './components/notification/notification.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { RelativeTimePipe } from './pipes/relative-time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    ArtistDetailsComponent,
    ArtistInfoComponent,
    ArtistArtworksComponent,
    NotificationComponent,
    LoginComponent,
    RegisterComponent,
    FavoritesComponent,
    RelativeTimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
