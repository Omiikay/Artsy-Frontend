import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationType } from '../models/notification.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  constructor() {}

  /**
   * Show a new notification
   */
  showNotification(message: string, type: NotificationType): void {
    const id = uuidv4();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };

    // Add new notification to the list
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      this.removeNotification(id);
    }, 3000);
  }

  /**
   * Remove a notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }
}
