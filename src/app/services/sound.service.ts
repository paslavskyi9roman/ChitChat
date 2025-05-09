import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private messageSound: HTMLAudioElement;
  private notificationSound: HTMLAudioElement;
  private enabled = true;

  constructor() {
    // Create audio elements
    this.messageSound = new Audio('assets/sounds/message.mp3');
    this.notificationSound = new Audio('assets/sounds/notification.mp3');

    // Load sounds
    this.preloadSounds();
  }

  private preloadSounds(): void {
    this.messageSound.load();
    this.notificationSound.load();
  }

  playMessageSound(): void {
    if (this.enabled) {
      this.messageSound.currentTime = 0;
      this.messageSound.play().catch((error) => {
        console.error('Error playing message sound:', error);
      });
    }
  }

  playNotificationSound(): void {
    if (this.enabled) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch((error) => {
        console.error('Error playing notification sound:', error);
      });
    }
  }

  toggleSounds(enable: boolean): void {
    this.enabled = enable;
  }

  isSoundEnabled(): boolean {
    return this.enabled;
  }
}
