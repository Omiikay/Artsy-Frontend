import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: false
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  /**
   * Get Bootstrap alert class for notification type
   */
  getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'danger':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }
}
