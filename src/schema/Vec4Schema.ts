// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.14
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class Vec4Schema extends Schema {
    @type("number") public x!: number;
    @type("number") public y!: number;
    @type("number") public z!: number;
    @type("number") public w!: number;
}
