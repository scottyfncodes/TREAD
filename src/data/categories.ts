import type { Category, CategoryId } from '../domain/adventure'

/**
 * The category registry. Screens render whatever is here; adding a category
 * is one entry plus tagging adventures with it.
 */
export const CATEGORIES: Category[] = [
  { id: 'offroad', label: 'Off-road', emoji: '🪨', blurb: 'Designated 4x4 and OHV routes, rated honestly.' },
  { id: 'scenic_drive', label: 'Scenic drives', emoji: '🛣️', blurb: 'The road is the destination.' },
  { id: 'day_trip', label: 'Day trips', emoji: '🗺️', blurb: 'Out and back in a day.' },
  { id: 'road_trip', label: 'Road trips', emoji: '🚐', blurb: 'Multi-day routes and places worth the drive.' },
  { id: 'camping', label: 'Camping', emoji: '⛺', blurb: 'Campgrounds and designated sites.' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾', blurb: 'Walks from the parking area.' },
  { id: 'lookouts', label: 'Lookouts', emoji: '🔭', blurb: 'Overlooks and viewpoints.' },
  { id: 'parks', label: 'Parks', emoji: '🏞️', blurb: 'National and state parks.' },
  { id: 'mountains', label: 'Mountains', emoji: '🏔️', blurb: 'High country.' },
  { id: 'lakes', label: 'Lakes & rivers', emoji: '🌊', blurb: 'Water on the way.' },
  { id: 'skiing', label: 'Skiing', emoji: '🎿', blurb: 'Ski areas and winter access.' },
  { id: 'history', label: 'History', emoji: '🏚️', blurb: 'Ghost towns, mines, rock art.' },
  { id: 'towns', label: 'Towns', emoji: '🏘️', blurb: 'Gateway towns worth a stop.' },
  { id: 'roadside', label: 'Roadside', emoji: '📍', blurb: 'Odd and interesting stops.' },
  { id: 'vehicle_destinations', label: 'Vehicle meccas', emoji: '🚙', blurb: 'Places people bring their rigs.' },
  { id: 'food', label: 'Food', emoji: '🍔', blurb: 'Places to eat.' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', blurb: 'Caffeine before the dirt.' },
  { id: 'breweries', label: 'Breweries', emoji: '🍺', blurb: 'After the drive, not before.' },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>

/** Categories answered by food stops rather than adventures. */
export const FOOD_CATEGORIES: CategoryId[] = ['food', 'coffee', 'breweries']
