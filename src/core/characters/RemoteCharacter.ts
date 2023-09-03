import { Entity } from "../engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";
import { moveTowardsVector3 } from "../../Utils";

export class RemoteCharacter extends Entity<PlayerSchema> {
  constructor(assetName: string, updator: PlayerSchema) {
    super(assetName, updator);

    updator.transform.position.onChange(() => {
      this.serverPosition.set(
        updator.transform.position.x,
        updator.transform.position.y,
        updator.transform.position.z
      );
    });
    updator.transform.quaternion.onChange(() => {
      this.serverQuaternion.set(
        updator.transform.quaternion.x,
        updator.transform.quaternion.y,
        updator.transform.quaternion.z,
        updator.transform.quaternion.w
      );
    });
    updator.transform.scale.onChange(() => {
      this.serverScale.set(
        updator.transform.scale.x,
        updator.transform.scale.y,
        updator.transform.scale.z
      );
    });
  }

  Update(delta: number) {
    this.mesh.position = moveTowardsVector3(
      this.mesh.position,
      this.serverPosition,
      delta * this.moveSpeed
    );
  }
  Dispose() {
    console.log("remotecharacter dispose");
  }
}
