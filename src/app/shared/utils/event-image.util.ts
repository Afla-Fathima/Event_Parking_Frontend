import { EventItem } from '../../core/models/api.models';

export function getEventImage(event: EventItem): string {
  const category = (event.categoryName || '').toLowerCase();
  const name = (event.eventName || '').toLowerCase();

  if (
    category.includes('music') ||
    category.includes('concert') ||
    name.includes('music') ||
    name.includes('concert') ||
    name.includes('live')
  ) {
    return '/images/events/music.jpg';
  }

  if (
    category.includes('sport') ||
    name.includes('sport') ||
    name.includes('cricket') ||
    name.includes('football')
  ) {
    return '/images/events/sports.jpg';
  }

  if (
    category.includes('conference') ||
    category.includes('seminar') ||
    name.includes('conference')
  ) {
    return '/images/events/conference.jpg';
  }

  if (
    category.includes('cultural') ||
    name.includes('cultural')
  ) {
    return '/images/events/cultural.jpg';
  }

  if (
    category.includes('exhibition') ||
    name.includes('exhibition')
  ) {
    return '/images/events/exhibition.jpg';
  }

  if (category.includes('concert')) {
    return '/images/events/concert.jpg';
  }

  return '/images/events/default.jpg';
}