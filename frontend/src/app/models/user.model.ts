export interface User {
    id: string;
    fullname: string;
    email: string;
    profileImageUrl: string;
}
  
export interface AuthResponse {
    user: User;
}
  
export interface LoginCredentials {
    email: string;
    password: string;
}
  
export interface RegisterCredentials {
    fullname: string;
    email: string;
    password: string;
}