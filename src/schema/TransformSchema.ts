// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.14
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Vec3Schema } from './Vec3Schema'
import { Vec4Schema } from './Vec4Schema'

export class TransformSchema extends Schema {
    @type(Vec3Schema) public position: Vec3Schema = new Vec3Schema();
    @type(Vec4Schema) public quaternion: Vec4Schema = new Vec4Schema();
    @type(Vec3Schema) public scale: Vec3Schema = new Vec3Schema();
}
