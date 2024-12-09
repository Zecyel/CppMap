import { Location } from "../components/LocationShow.vue"

export async function computeOptions(city: string, days: number, prompt: string | number) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      name: 'Location 1',
      description: 'Some description, may be quite long......',
      coord: [25.301, 105.503],
      distance: '10km',
      time: '10:00',
    },
    {
      name: 'Location 2',
      description: 'Some description, may be quite long......',
      coord: [25.304, 105.504],
      distance: '10km',
      time: '10:00',
    },
    {
      name: 'Location 3',
      description: 'Some description, may be quite long......',
      coord: [25.305, 105.505],
      distance: '10km',
      time: '10:00',
    },
  ] satisfies Location[]
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
