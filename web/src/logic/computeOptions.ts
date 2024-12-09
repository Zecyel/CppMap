import { Location } from "../components/LocationShow.vue"

export async function computeOptions(city: string, prompt: string | number) {

    const positions = await (await fetch(`http://localhost:5000/ai/attractions?place=${city}`)).json()

    const data = await Promise.all(positions.map(async (position: { duration: number, name: string, description: string }) => {
        const { lat, lon } = await (await fetch(`http://localhost:18080/search_location?query=${position.name}`)).json()
        return {
            name: position.name,
            description: position.description,
            coord: [lat, lon],
            time: position.duration + 'h'
        }
    }))

    return data satisfies Location[];
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
