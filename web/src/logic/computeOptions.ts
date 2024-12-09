import { Location } from "../components/LocationShow.vue"

export async function computeOptions(city: string, days: number, prompt: string | number) {
    
    const positions = await (await fetch(`http://localhost:5000/ai/attractions?place=${city}`)).json()

    const data = await Promise.all(positions.map(async (position: { duration: number, name: string }) => {
        const { lat, lon } = await (await fetch(`http://localhost:18080/search_location?query=${position.name}`)).json()
        return {
            name: position.name,
            // description: `你说的对，但是《${position.name}》是由米哈游自主研发的一款全新开放世界冒险游戏。游戏发生在一个被称作「提瓦特」的幻想世界，在这里，被神选中的人将被授予「神之眼」，导引元素之力。你将扮演一位名为「旅行者」的神秘角色，在自由的旅行中邂逅性格各异、能力独特的同伴们，和他们一起击败强敌，找回失散的亲人——同时，逐步发掘「原神」的真相。`,
            description: '123',
            coord: [lat, lon],
            time: position.duration + 'h'
        }
    }))

    return data satisfies Location[];
}

export type Options = Awaited<ReturnType<typeof computeOptions>>
