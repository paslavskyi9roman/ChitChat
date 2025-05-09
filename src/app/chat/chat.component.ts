import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SoundService } from '../services/sound.service';
import { NotificationService } from '../services/notification.service';

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
  typingUsers: string[] = [];
  joined = false;
  isConnected = false;
  soundEnabled = true;
  notificationsEnabled = false;
  private subscriptions: Subscription[] = [];
  private windowFocused = true;
  private typingTimer: any;
  private typingTimeout: any;
  isTyping = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private soundService: SoundService,
    private notificationService: NotificationService
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
    this.soundEnabled = this.soundService.isSoundEnabled();
    this.notificationsEnabled = this.notificationService.isEnabled();

    console.log('User authenticated as:', this.nickname, 'in room:', this.room);

    // Track window focus for notifications
    window.addEventListener('focus', this.onWindowFocus.bind(this));
    window.addEventListener('blur', this.onWindowBlur.bind(this));

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

        // Play sound if the message is from another user
        if (msg.user !== this.nickname && this.soundEnabled) {
          this.soundService.playMessageSound();
        }

        // Show notification if window is not focused and notifications are enabled
        if (
          msg.user !== this.nickname &&
          !this.windowFocused &&
          this.notificationsEnabled
        ) {
          this.notificationService.showNotification(
            `New message from ${msg.user}`,
            {
              body: msg.text,
              icon: 'assets/favicon.ico',
              tag: 'chat-message',
            }
          );
        }
      })
    );

    // Subscribe to system messages
    this.subscriptions.push(
      this.chatService.getSystemMessages().subscribe((msg) => {
        console.log('System message received in component:', msg);
        this.messages.push({
          user: 'System',
          text: msg,
          timestamp: new Date().getTime(),
        });

        // Play notification sound for system messages
        if (this.soundEnabled) {
          this.soundService.playNotificationSound();
        }

        // Show notification if window is not focused and notifications are enabled
        if (!this.windowFocused && this.notificationsEnabled) {
          this.notificationService.showNotification('System Notification', {
            body: msg,
            icon: 'assets/favicon.ico',
            tag: 'system-message',
          });
        }
      })
    );

    // Subscribe to user list
    this.subscriptions.push(
      this.chatService.getUsers().subscribe((users) => {
        console.log('User list received in component:', users);

        // If the user list changed, play notification sound
        if (this.users.length !== users.length && this.users.length > 0) {
          // Play sound if enabled
          if (this.soundEnabled) {
            this.soundService.playNotificationSound();
          }

          // Show notification for users joining/leaving if window is not focused
          if (!this.windowFocused && this.notificationsEnabled) {
            const action = users.length > this.users.length ? 'joined' : 'left';
            this.notificationService.showNotification(
              `User ${action} the chat`,
              {
                body: `There are now ${users.length} users in the room`,
                icon: 'assets/favicon.ico',
                tag: 'user-update',
              }
            );
          }
        }

        this.users = users;
      })
    );

    // Subscribe to typing status updates
    this.subscriptions.push(
      this.chatService.getTypingStatus().subscribe((status) => {
        console.log('Typing status received in component:', status);

        // Filter out current user
        if (status.user === this.nickname) {
          console.log('Ignoring own typing status');
          return;
        }

        if (status.isTyping) {
          // Add user to typing list if not already there
          if (!this.typingUsers.includes(status.user)) {
            console.log(`Adding ${status.user} to typing users list`);
            this.typingUsers.push(status.user);
            console.log('Updated typing users list:', this.typingUsers);
          }
        } else {
          // Remove user from typing list
          console.log(`Removing ${status.user} from typing users list`);
          this.typingUsers = this.typingUsers.filter(
            (user) => user !== status.user
          );
          console.log('Updated typing users list:', this.typingUsers);
        }
      })
    );
  }

  // Format timestamp to human-readable time
  formatTimestamp(timestamp: number | Date | string): string {
    if (!timestamp) return '';

    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    // Return time in format HH:MM
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private onWindowFocus() {
    this.windowFocused = true;
  }

  private onWindowBlur() {
    this.windowFocused = false;
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

    // Remove window event listeners
    window.removeEventListener('focus', this.onWindowFocus.bind(this));
    window.removeEventListener('blur', this.onWindowBlur.bind(this));

    // Clear any timers
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  sendMessage() {
    if (!this.message.trim()) {
      return;
    }

    console.log('Sending message:', this.message);

    // Send to server
    this.chatService.sendMessage(this.message);

    // Clear the input
    this.message = '';
  }

  onInputChange() {
    // Send typing indicator when user starts typing
    console.log('User input detected, setting typing status to true');
    this.chatService.setTypingStatus(true);
  }

  onKeyUp(event: any) {
    if (!this.isTyping) {
      this.chatService.typing();
      this.isTyping = true;
    }

    // Clear timeout if it exists
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set a new timeout to stop typing after 1 second of inactivity
    this.typingTimeout = setTimeout(() => {
      this.chatService.stopTyping();
      this.isTyping = false;
    }, 1000);
  }

  getTypingDisplay(): string {
    const count = this.typingUsers.length;

    if (count === 0) {
      return '';
    } else if (count === 1) {
      return `${this.typingUsers[0]} is typing...`;
    } else if (count === 2) {
      return `${this.typingUsers[0]} and ${this.typingUsers[1]} are typing...`;
    } else {
      return `${count} people are typing...`;
    }
  }

  logout() {
    console.log('Logging out user');
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundService.toggleSounds(this.soundEnabled);
  }

  toggleNotifications() {
    if (!this.notificationsEnabled) {
      this.notificationService
        .requestPermission()
        .then((permission) => {
          this.notificationsEnabled = permission === 'granted';
        })
        .catch((err) => {
          console.error('Error requesting notification permission:', err);
        });
    } else {
      this.notificationsEnabled = false;
      this.notificationService.toggleNotifications(false);
    }
  }
}
