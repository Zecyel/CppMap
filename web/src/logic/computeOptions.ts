import { Location } from "../components/LocationShow.vue"
import { fetchJson } from "./fetchJson"

export async function computeOptions(city: string, prompt: string | number) {
    const positions = await fetchJson<{ duration: number, name: string, description: string }[]>(`http://localhost:5000/ai/attractions?place=${encodeURIComponent(city)}&prompt=${encodeURIComponent(prompt)}`)

    return Promise.all(positions.map(async (position) => {
        const { lat, lon } = await fetchJson(`http://localhost:18080/search_location?query=${encodeURIComponent(position.name)}`)
        return {
            name: position.name,
            description: position.description,
            coord: [lat, lon],
            time: position.duration + 'h'
        } satisfies Location
    }))
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
