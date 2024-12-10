export type NodeId = number

export interface Location {
  name: string
  description: string
  coord: [number, number]
  distance?: string
  time?: string
  nearestNode: NodeId,
}
