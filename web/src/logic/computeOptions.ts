import { Location } from "../components/LocationShow.vue"

export async function computeOptions(city: string, days: number, isRelax: boolean) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      name: 'Location 1',
      description: 'Some description, may be quite long......',
      coord: [31.301, 121.503],
      distance: '10km',
      time: '10:00',
    },
    {
      name: 'Location 2',
      description: 'Some description, may be quite long......',
      coord: [31.304, 121.504],
      distance: '10km',
      time: '10:00',
    },
    {
      name: 'Location 3',
      description: 'Some description, may be quite long......',
      coord: [31.305, 121.505],
      distance: '10km',
      time: '10:00',
    },
  ] satisfies Location[]
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
