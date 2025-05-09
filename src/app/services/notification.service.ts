import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private enabled = false;
  private permission: NotificationPermission = 'default';

  constructor() {
    // Check if browser supports notifications
    this.checkNotificationSupport();
  }

  private checkNotificationSupport(): void {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }

    // Check notification permission
    this.permission = Notification.permission;

    // If permission is granted, enable notifications
    if (this.permission === 'granted') {
      this.enabled = true;
    }
  }

  requestPermission(): Promise<NotificationPermission> {
    return new Promise<NotificationPermission>((resolve, reject) => {
      if (!('Notification' in window)) {
        reject('Notifications not supported');
        return;
      }

      Notification.requestPermission()
        .then((permission) => {
          this.permission = permission;
          if (permission === 'granted') {
            this.enabled = true;
          }
          resolve(permission);
        })
        .catch((error) => {
          console.error('Error requesting notification permission:', error);
          reject(error);
        });
    });
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.enabled || this.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, options);

      // Auto close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggleNotifications(enable: boolean): void {
    if (enable && this.permission !== 'granted') {
      this.requestPermission();
    } else {
      this.enabled = enable;
    }
  }
}
