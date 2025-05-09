import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  room = new FormControl('general', [Validators.required]);
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Login component initialized');

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to chat');
      this.router.navigate(['/chat']);
    }

    // Set username from localStorage if it exists
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      console.log('Restoring saved username:', savedUsername);
      this.username.setValue(savedUsername);
    }

    // Set room from localStorage if it exists
    const savedRoom = localStorage.getItem('room');
    if (savedRoom) {
      console.log('Restoring saved room:', savedRoom);
      this.room.setValue(savedRoom);
    }
  }

  // Direct approach with simple login
  onSubmit(): void {
    console.log('Login button clicked');

    // Basic validation
    if (!this.username.value || this.username.value.length < 3) {
      this.errorMessage =
        'Please enter a valid username (at least 3 characters)';
      return;
    }

    const name = this.username.value;
    const roomName = this.room.value || 'general';

    console.log('Login with:', { name, roomName });

    // Directly manipulate localStorage
    localStorage.setItem('username', name);
    localStorage.setItem('room', roomName);

    // Also update the service
    this.authService.setCredentials(name, roomName);

    // Connect to chat
    this.chatService.joinRoom(name, roomName);

    // Navigate to chat
    this.router.navigate(['/chat']);
  }
}
