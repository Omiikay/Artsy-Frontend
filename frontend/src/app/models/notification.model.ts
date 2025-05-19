export type NotificationType = 'success' | 'danger' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number; // Timestamp when notification was created
}
