import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  pure: false, // Set to false to update every change detection cycle,
  standalone: false // This pipe is not standalone
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

    // Less than a minute
    if (seconds < 60) {
      return formatter.format(-seconds, 'second');
    }

    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return formatter.format(-minutes, 'minute');
    }

    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return formatter.format(-hours, 'hour');
    }

    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return formatter.format(-days, 'day');
    }

    // Less than a month
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return formatter.format(-weeks, 'week');
    }

    // Less than a year
    const months = Math.floor(days / 30);
    if (months < 12) {
      return formatter.format(-months, 'month');
    }

    // More than a year
    const years = Math.floor(days / 365);
    return formatter.format(-years, 'year');
  }
}