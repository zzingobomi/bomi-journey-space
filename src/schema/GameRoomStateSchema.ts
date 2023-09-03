// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.14
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { PlayerSchema } from './PlayerSchema'

export class GameRoomStateSchema extends Schema {
    @type({ map: PlayerSchema }) public players: MapSchema<PlayerSchema> = new MapSchema<PlayerSchema>();
}
