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
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
    }

    // Set username from localStorage if it exists
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username.setValue(savedUsername);
    }

    // Set room from localStorage if it exists
    const savedRoom = localStorage.getItem('room');
    if (savedRoom) {
      this.room.setValue(savedRoom);
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (this.username.valid && this.room.valid) {
      this.isSubmitting = true;
      const name = this.username.value as string;
      const roomName = this.room.value as string;

      console.log('Login submitted:', { name, roomName });

      // Save credentials
      this.authService.setCredentials(name, roomName);

      // Connect to chat
      this.chatService.joinRoom(name, roomName);

      // Navigate to chat room after a small delay
      setTimeout(() => {
        this.isSubmitting = false;
        console.log('Navigating to /chat');
        this.router.navigate(['/chat']);
      }, 500);
    } else {
      this.errorMessage =
        'Please enter a valid username (at least 3 characters)';
    }
  }
}
