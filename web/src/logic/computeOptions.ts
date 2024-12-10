import type { Location } from '../types'
import { fetchJson } from "./fetchJson"
import { computePathLength } from "./pathLength"

export interface Hotel {
    hotel_id: number,
    lat: number,
    lon: number,
    nearest_road_node_id: number
}

export default async function computeOptions(city: string, prompt: string | number) {
    const infos = await fetchJson<{ duration: number, name: string, description: string }[]>(`http://localhost:5000/ai/attractions?place=${encodeURIComponent(city)}&prompt=${encodeURIComponent(prompt)}`)

    const locations = await Promise.all(infos.map(async (position) => {
        const { lat, lon } = await fetchJson(`http://localhost:18080/search_location?query=${encodeURIComponent(position.name)}`)
        return {
            name: position.name,
            description: position.description,
            coord: [lat, lon],
            time: position.duration + 'h',
            nearestNode: (await fetchJson(`http://localhost:18080/nearest_node?lat=${lat}&lon=${lon}`)).nearest_point
        } satisfies Location
    }))

    const paths: Record<string, Record<string, { path: [number, number][], distance: number }>> = {}
    await Promise.all(locations.entries().map(async ([i, start]) => {
        paths[start.nearestNode] = {}
        const ends = locations.slice(i + 1)
        const result = (await fetchJson(
            `http://localhost:18080/shortest_paths?start=${start.nearestNode}&end=${ends.map(n => n.nearestNode).join(',')}`,
        )).paths
        for (const [j, path] of result.entries()) {
            const normalizedPath = path.map(({ lat, lon }: any) => [lat, lon] as [number, number])
            const normalizedDistance = computePathLength(normalizedPath)
            paths[start.nearestNode][ends[j].nearestNode] = { path: normalizedPath, distance: normalizedDistance }
        }
    }))
    console.log('Shortest paths between options:', paths)

    const hotels: Hotel[] = (await fetchJson(`http://localhost:18080/hotels`)).hotel_nodes

    return {
        locations,
        paths,
        hotels,
    }
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
