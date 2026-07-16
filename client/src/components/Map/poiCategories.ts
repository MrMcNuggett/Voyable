import { Utensils, Coffee, Wine, BedDouble, Camera, Landmark, Trees, Ticket, type LucideIcon } from 'lucide-react'

// The POI categories shown in the map "explore" pill. The `key` is the contract
// with the server (CATEGORY_OSM_FILTERS in mapsService.ts) — the OSM tag mapping
// lives there; label/icon/colour live here. `color` doubles as the active-pill
// fill AND the marker colour, so the pill and the map agree visually.
export interface PoiCategory {
  key: string
  labelKey: string
  Icon: LucideIcon
  color: string
}

export const POI_CATEGORIES: PoiCategory[] = [
  { key: 'restaurant', labelKey: 'poi.cat.restaurants', Icon: Utensils, color: 'var(--danger)' },
  { key: 'cafe', labelKey: 'poi.cat.cafes', Icon: Coffee, color: 'var(--warning)' },
  { key: 'bar', labelKey: 'poi.cat.bars', Icon: Wine, color: '#A855F7' },  // theme-lint-disable: intentional data/category color
  { key: 'hotel', labelKey: 'poi.cat.hotels', Icon: BedDouble, color: 'var(--info)' },
  { key: 'sights', labelKey: 'poi.cat.sights', Icon: Camera, color: '#EC4899' },  // theme-lint-disable: intentional data/category color
  { key: 'museum', labelKey: 'poi.cat.museums', Icon: Landmark, color: '#6366F1' },  // theme-lint-disable: intentional data/category color
  { key: 'nature', labelKey: 'poi.cat.nature', Icon: Trees, color: 'var(--success)' },
  { key: 'activity', labelKey: 'poi.cat.activities', Icon: Ticket, color: 'var(--warning)' },
]

export const POI_CATEGORY_BY_KEY: Record<string, PoiCategory> = Object.fromEntries(
  POI_CATEGORIES.map(c => [c.key, c]),
)

// One POI result from /api/maps/pois (mirror of the server's OverpassPoi).
export interface Poi {
  osm_id: string
  name: string
  lat: number
  lng: number
  category: string
  poi_type: string
  address: string | null
  website: string | null
  phone: string | null
  opening_hours: string | null
  cuisine: string | null
  source: 'openstreetmap'
}
