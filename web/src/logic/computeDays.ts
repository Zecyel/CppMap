import { Location } from '../components/LocationShow.vue'

export function computeDays(chosen: Location[], days: number): Location[][] {
  return Array.from({ length: days }).map(() => chosen)
}
