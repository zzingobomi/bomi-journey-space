import { Vector2, Vector3, Vector4, Quaternion } from "@babylonjs/core";
import { Protocol } from "./shared/Protocol";

export const getMessageBytes = {
  [Protocol.JOIN_ROOM]: () => {
    return new Uint8Array([Protocol.JOIN_ROOM]);
  },
  [Protocol.ENTITY_POSITION]: (position: Vector3) =>
    encodeFloat32ArrayMessage(Protocol.ENTITY_POSITION, [
      position.x,
      position.y,
      position.z,
    ]),
  [Protocol.ENTITY_QUATERNION]: (quaternion: Quaternion) =>
    encodeFloat32ArrayMessage(Protocol.ENTITY_QUATERNION, [
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w,
    ]),
  [Protocol.ENTITY_SCALE]: (scale: Vector3) =>
    encodeFloat32ArrayMessage(Protocol.ENTITY_SCALE, [
      scale.x,
      scale.y,
      scale.z,
    ]),
};

const encodeFloat32ArrayMessage = (protocol: Protocol, values: number[]) => {
  const float32Array = new Float32Array(values);
  const uint8Array = new Uint8Array(float32Array.buffer);

  return new Uint8Array([protocol, ...uint8Array]);
};

export function moveTowardsVector2(
  current: Vector2,
  target: Vector2,
  maxDistanceDelta: number
): Vector2 {
  const result: Vector2 = new Vector2(0.0, 0.0);
  moveTowardsVector2ToRef(current, target, maxDistanceDelta, result);
  return result;
}
export function moveTowardsVector2ToRef(
  current: Vector2,
  target: Vector2,
  maxDistanceDelta: number,
  result: Vector2
): void {
  const toVector_x: number = target.x - current.x;
  const toVector_y: number = target.y - current.y;
  const sqDist: number = toVector_x * toVector_x + toVector_y * toVector_y;
  if (
    sqDist == 0 ||
    (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)
  ) {
    result.set(target.x, target.y);
  } else {
    const dist: number = Math.sqrt(sqDist);
    result.set(
      current.x + (toVector_x / dist) * maxDistanceDelta,
      current.y + (toVector_y / dist) * maxDistanceDelta
    );
  }
}

export function moveTowardsVector3(
  current: Vector3,
  target: Vector3,
  maxDistanceDelta: number
): Vector3 {
  const result: Vector3 = new Vector3(0.0, 0.0, 0.0);
  moveTowardsVector3ToRef(current, target, maxDistanceDelta, result);
  return result;
}
export function moveTowardsVector3ToRef(
  current: Vector3,
  target: Vector3,
  maxDistanceDelta: number,
  result: Vector3
): void {
  const toVector_x: number = target.x - current.x;
  const toVector_y: number = target.y - current.y;
  const toVector_z: number = target.z - current.z;
  const sqDist: number =
    toVector_x * toVector_x + toVector_y * toVector_y + toVector_z * toVector_z;
  if (
    sqDist == 0 ||
    (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)
  ) {
    result.set(target.x, target.y, target.z);
  } else {
    const dist: number = Math.sqrt(sqDist);
    result.set(
      current.x + (toVector_x / dist) * maxDistanceDelta,
      current.y + (toVector_y / dist) * maxDistanceDelta,
      current.z + (toVector_z / dist) * maxDistanceDelta
    );
  }
}

export function moveTowardsVector4(
  current: Vector4,
  target: Vector4,
  maxDistanceDelta: number
): Vector4 {
  const result: Vector4 = new Vector4(0.0, 0.0, 0.0, 0.0);
  moveTowardsVector4ToRef(current, target, maxDistanceDelta, result);
  return result;
}
export function moveTowardsVector4ToRef(
  current: Vector4,
  target: Vector4,
  maxDistanceDelta: number,
  result: Vector4
): void {
  const toVector_x: number = target.x - current.x;
  const toVector_y: number = target.y - current.y;
  const toVector_z: number = target.z - current.z;
  const toVector_w: number = target.w - current.w;
  const sqDist: number =
    toVector_x * toVector_x +
    toVector_y * toVector_y +
    toVector_z * toVector_z +
    toVector_w * toVector_w;
  if (
    sqDist == 0 ||
    (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)
  ) {
    result.set(target.x, target.y, target.z, target.w);
  } else {
    const dist: number = Math.sqrt(sqDist);
    result.set(
      current.x + (toVector_x / dist) * maxDistanceDelta,
      current.y + (toVector_y / dist) * maxDistanceDelta,
      current.z + (toVector_z / dist) * maxDistanceDelta,
      current.w + (toVector_w / dist) * maxDistanceDelta
    );
  }
}

export function moveTowardsQuaternion(
  current: Quaternion,
  target: Quaternion,
  maxDistanceDelta: number
): Quaternion {
  const result: Quaternion = new Quaternion();
  moveTowardsQuaternionToRef(current, target, maxDistanceDelta, result);
  return result;
}

export function moveTowardsQuaternionToRef(
  current: Quaternion,
  target: Quaternion,
  maxDistanceDelta: number,
  result: Quaternion
): void {
  const dot: number = Quaternion.Dot(current, target);

  if (dot > 0.99999) {
    Quaternion.SlerpToRef(current, target, maxDistanceDelta, result);
    result.normalize();
  } else {
    Quaternion.SlerpToRef(current, target, maxDistanceDelta, result);
  }
}
