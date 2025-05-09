import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usernameSubject = new BehaviorSubject<string>('');
  private roomSubject = new BehaviorSubject<string>('');
  private authenticated = false;

  constructor() {
    // Check localStorage for saved credentials
    const savedUsername = localStorage.getItem('username');
    const savedRoom = localStorage.getItem('room');

    if (savedUsername) {
      this.usernameSubject.next(savedUsername);
    }

    if (savedRoom) {
      this.roomSubject.next(savedRoom);
    }

    // Initial authentication state based on saved credentials
    this.authenticated = !!(savedUsername && savedRoom);
  }

  // Save user credentials
  setCredentials(username: string, room: string): void {
    console.log('Setting credentials:', username, room);
    localStorage.setItem('username', username);
    localStorage.setItem('room', room);

    this.usernameSubject.next(username);
    this.roomSubject.next(room);
    this.authenticated = true;
  }

  // Get current username
  getUsername(): string {
    return this.usernameSubject.value;
  }

  // Get current room
  getRoom(): string {
    return this.roomSubject.value;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    // Check if we have both username and room set
    console.log('Auth check - Username:', this.usernameSubject.value);
    console.log('Auth check - Room:', this.roomSubject.value);
    console.log('Auth check - Authenticated:', this.authenticated);
    return (
      this.authenticated &&
      !!this.usernameSubject.value &&
      !!this.roomSubject.value
    );
  }

  // Logout
  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('username');
    localStorage.removeItem('room');

    this.usernameSubject.next('');
    this.roomSubject.next('');
    this.authenticated = false;
  }
}
