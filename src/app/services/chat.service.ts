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

  constructor() {
    this.setupSocketConnection();
  }

  private setupSocketConnection() {
    this.socket = io(this.SERVER_URL);

    // Add connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.connectionStatus.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connectionStatus.next(false);
    });
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  joinRoom(nickname: string, room: string) {
    console.log('Joining room:', room, 'as', nickname);
    this.socket.emit('join room', { nickname, room });
  }

  sendMessage(message: string) {
    console.log('Sending message:', message);
    this.socket.emit('chat message', message);
  }

  getMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('chat message', (msg) => {
        console.log('Received message:', msg);
        observer.next(msg);
      });
    });
  }

  getSystemMessages(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('system message', (msg) => {
        console.log('Received system message:', msg);
        observer.next(msg);
      });
    });
  }

  getUsers(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on('user list', (users) => {
        console.log('Received user list:', users);
        observer.next(users);
      });
    });
  }
}
