import type { Room, Plan } from "./house-types.ts"

const home = (rooms: Room[], furniture: string[], workshop?: string): Plan => ({ rooms, hearth: true, kitchen: true, workshop, furniture })
const bed = (name: string, floor: number, beds: number): Room => ({ name, floor, beds })
const room = (name: string, floor: number): Room => ({ name, floor })

export { home, bed, room }
