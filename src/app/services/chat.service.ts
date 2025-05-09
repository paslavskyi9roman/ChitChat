import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

interface ChatMessage {
  id?: string;
  user: string;
  text: string;
  timestamp: number;
}

interface TypingStatus {
  user: string;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: Socket;
  private readonly SERVER_URL = 'http://localhost:3000';
  private connectionStatus = new Subject<boolean>();
  private messagesSubject = new Subject<ChatMessage>();
  private systemMessagesSubject = new Subject<string>();
  private usersListSubject = new Subject<string[]>();
  private typingStatusSubject = new Subject<TypingStatus>();
  private currentRoom: string = '';
  private currentUser: string = '';
  private typingTimeout: any;

  // Cache to prevent duplicate messages
  private processedMessageIds = new Set<string>();

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

    // Single handler for all message events
    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    // Process both 'message' and 'chat message' events with the same handler to avoid duplicates
    const messageHandler = (msg: any) => {
      console.log('Received message:', msg);
      let messageObj: ChatMessage;

      // Handle string messages (convert to object)
      if (typeof msg === 'string') {
        messageObj = {
          text: msg,
          user: 'Unknown',
          timestamp: Date.now(),
        };
      } else {
        messageObj = msg;
      }

      // Ensure the message has an ID
      const messageId =
        messageObj.id ||
        `${messageObj.user}-${messageObj.timestamp || Date.now()}`;

      // Skip if we've already processed this message
      if (this.processedMessageIds.has(messageId)) {
        console.log('Skipping duplicate message:', messageId);
        return;
      }

      // Add to processed messages
      this.processedMessageIds.add(messageId);

      // Limit cache size to prevent memory leaks
      if (this.processedMessageIds.size > 200) {
        const oldestId = Array.from(this.processedMessageIds)[0];
        this.processedMessageIds.delete(oldestId);
      }

      // Forward to subscribers
      this.messagesSubject.next(messageObj);
    };

    // Apply the handler to both event types
    this.socket.on('message', messageHandler);
    this.socket.on('chat message', messageHandler);

    // System messages
    this.socket.on('system message', (msg) => {
      console.log('Received system message:', msg);
      this.systemMessagesSubject.next(msg);
    });

    // User lists (handle both event types)
    const userHandler = (users: string[]) => {
      console.log('Received users update:', users);
      this.usersListSubject.next(users);
    };

    this.socket.on('user list', userHandler);
    this.socket.on('users', userHandler);

    // Typing status
    this.socket.on('typing status', (status: TypingStatus) => {
      console.log('Typing status received:', status);

      // Make sure the status is in the expected format
      if (
        typeof status === 'object' &&
        'user' in status &&
        'isTyping' in status
      ) {
        this.typingStatusSubject.next(status);
      } else {
        console.error('Received malformed typing status:', status);
      }
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

    // Clear message cache when joining a new room
    this.processedMessageIds.clear();

    // Try both event formats
    this.socket.emit('join room', { nickname, room });
    this.socket.emit('join', { username: nickname, room });
  }

  sendMessage(message: string) {
    console.log('Sending message:', message);

    const timestamp = Date.now();
    const messageId = `${this.currentUser}-${timestamp}`;

    // Add to processed messages to prevent echo
    this.processedMessageIds.add(messageId);

    // Try both event formats
    this.socket.emit('chat message', message);
    this.socket.emit('message', {
      id: messageId,
      text: message,
      user: this.currentUser,
      username: this.currentUser, // For compatibility
      timestamp: timestamp,
    });

    // Also set typing to false when sending a message
    this.setTypingStatus(false);
  }

  setTypingStatus(isTyping: boolean) {
    // Clear any existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    console.log(
      `Setting typing status to ${isTyping} for user ${this.currentUser}`
    );

    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send typing status: socket not connected');
      return;
    }

    // Send typing status to server - ensure we send EXACTLY what the server expects
    this.socket.emit('typing', isTyping);

    // Log debug info
    console.log(`Emitted 'typing' event to server with status: ${isTyping}`);

    // If user is typing, automatically reset after 3 seconds of inactivity
    if (isTyping) {
      this.typingTimeout = setTimeout(() => {
        console.log('Typing timeout expired, setting typing status to false');
        this.socket.emit('typing', false);
      }, 3000);
    }
  }

  typing() {
    this.setTypingStatus(true);
  }

  stopTyping() {
    this.setTypingStatus(false);
  }

  getMessages(): Observable<ChatMessage> {
    return this.messagesSubject.asObservable();
  }

  getSystemMessages(): Observable<string> {
    return this.systemMessagesSubject.asObservable();
  }

  getUsers(): Observable<string[]> {
    return this.usersListSubject.asObservable();
  }

  getTypingStatus(): Observable<TypingStatus> {
    return this.typingStatusSubject.asObservable();
  }
}
