import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: Socket;
  private readonly SERVER_URL = 'http://localhost:3000';
  private connectionStatus = new Subject<boolean>();
  private messagesSubject = new Subject<any>();
  private systemMessagesSubject = new Subject<string>();
  private usersListSubject = new Subject<string[]>();
  private currentRoom: string = '';
  private currentUser: string = '';

  constructor() {
    this.setupSocketConnection();
  }

  private setupSocketConnection() {
    console.log('Setting up socket connection to', this.SERVER_URL);

    // Connect with options for better reliability
    this.socket = io(this.SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    // Add connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.connectionStatus.next(true);

      // Rejoin room if we have current room and user
      if (this.currentRoom && this.currentUser) {
        this.joinRoom(this.currentUser, this.currentRoom);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatus.next(false);
    });

    // Set up message listeners
    this.socket.on('message', (msg) => {
      console.log('Received message:', msg);
      this.messagesSubject.next(msg);
    });

    this.socket.on('chat message', (msg) => {
      console.log('Received chat message:', msg);
      this.messagesSubject.next(msg);
    });

    this.socket.on('system message', (msg) => {
      console.log('Received system message:', msg);
      this.systemMessagesSubject.next(msg);
    });

    this.socket.on('user list', (users) => {
      console.log('Received user list:', users);
      this.usersListSubject.next(users);
    });

    this.socket.on('users', (users) => {
      console.log('Received users update:', users);
      this.usersListSubject.next(users);
    });
  }

  // Force reconnection if needed
  reconnect() {
    if (!this.socket.connected) {
      console.log('Attempting to reconnect to server');
      this.socket.connect();
    }
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  joinRoom(nickname: string, room: string) {
    console.log('Joining room:', room, 'as', nickname);

    // Store current values
    this.currentUser = nickname;
    this.currentRoom = room;

    // Make sure we're connected before trying to join
    if (!this.socket.connected) {
      console.log('Socket not connected, attempting to connect first');
      this.socket.connect();
    }

    // Try both event formats
    this.socket.emit('join room', { nickname, room });
    this.socket.emit('join', { username: nickname, room });
  }

  sendMessage(message: string) {
    console.log('Sending message:', message);

    // Try both event formats
    this.socket.emit('chat message', message);
    this.socket.emit('message', {
      text: message,
      username: this.currentUser,
      timestamp: new Date(),
    });
  }

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  getSystemMessages(): Observable<string> {
    return this.systemMessagesSubject.asObservable();
  }

  getUsers(): Observable<string[]> {
    return this.usersListSubject.asObservable();
  }
}
