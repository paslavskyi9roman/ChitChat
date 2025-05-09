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
    console.log('Auth service initialized');
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    // Check localStorage for saved credentials
    const savedUsername = localStorage.getItem('username');
    const savedRoom = localStorage.getItem('room');

    console.log('Loading from localStorage - Username:', savedUsername);
    console.log('Loading from localStorage - Room:', savedRoom);

    if (savedUsername) {
      this.usernameSubject.next(savedUsername);
    }

    if (savedRoom) {
      this.roomSubject.next(savedRoom);
    }

    // Initial authentication state based on saved credentials
    this.authenticated = !!(savedUsername && savedRoom);
    console.log('Initial authentication state:', this.authenticated);
  }

  // Save user credentials
  setCredentials(username: string, room: string): void {
    console.log('Setting credentials:', username, room);

    if (!username || !room) {
      console.error('Invalid credentials provided:', { username, room });
      return;
    }

    try {
      localStorage.setItem('username', username);
      localStorage.setItem('room', room);
      console.log('Credentials saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    this.usernameSubject.next(username);
    this.roomSubject.next(room);
    this.authenticated = true;
    console.log('Authentication state updated:', this.authenticated);
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
    const username = this.usernameSubject.value;
    const room = this.roomSubject.value;

    console.log('Auth check - Username:', username);
    console.log('Auth check - Room:', room);
    console.log('Auth check - Authenticated:', this.authenticated);

    return this.authenticated && !!username && !!room;
  }

  // Logout
  logout(): void {
    console.log('Logging out user');
    try {
      localStorage.removeItem('username');
      localStorage.removeItem('room');
      console.log('Credentials removed from localStorage');
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }

    this.usernameSubject.next('');
    this.roomSubject.next('');
    this.authenticated = false;
    console.log('Authentication state updated:', this.authenticated);
  }
}
