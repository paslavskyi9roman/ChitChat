import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  nickname = '';
  room = '';
  message = '';
  messages: any[] = [];
  users: string[] = [];
  joined = false;
  isConnected = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Chat component initialized');

    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/']);
      return;
    }

    this.nickname = this.authService.getUsername();
    this.room = this.authService.getRoom();

    console.log('User authenticated as:', this.nickname, 'in room:', this.room);

    // Subscribe to connection status
    this.subscriptions.push(
      this.chatService.getConnectionStatus().subscribe((status) => {
        console.log('Connection status changed:', status);
        this.isConnected = status;

        // If connected and not joined yet, join the room
        if (status && !this.joined && this.nickname && this.room) {
          this.joinChat();
        }
      })
    );

    // Subscribe to messages
    this.subscriptions.push(
      this.chatService.getMessages().subscribe((msg) => {
        console.log('Message received in component:', msg);
        this.messages.push(msg);
      })
    );

    // Subscribe to system messages
    this.subscriptions.push(
      this.chatService.getSystemMessages().subscribe((msg) => {
        console.log('System message received in component:', msg);
        this.messages.push({ user: 'System', text: msg });
      })
    );

    // Subscribe to user list
    this.subscriptions.push(
      this.chatService.getUsers().subscribe((users) => {
        console.log('User list received in component:', users);
        this.users = users;
      })
    );
  }

  joinChat() {
    console.log('Joining chat room:', this.room);
    this.chatService.joinRoom(this.nickname, this.room);
    this.joined = true;
  }

  ngOnDestroy() {
    console.log(
      'Chat component destroyed, unsubscribing from all subscriptions'
    );
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  sendMessage() {
    if (this.message.trim()) {
      console.log('Sending message:', this.message);
      this.chatService.sendMessage(this.message);
      // Add message to local messages immediately for better UX
      this.messages.push({
        user: this.nickname,
        text: this.message,
        timestamp: new Date(),
      });
      this.message = '';
    }
  }

  logout() {
    console.log('Logging out user');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
