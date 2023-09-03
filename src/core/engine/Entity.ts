import { AbstractMesh, Vector3, Quaternion } from "@babylonjs/core";
import { Managers } from "@src/managers/Managers";
import { EntitySchema } from "@src/schema/EntitySchema";

export abstract class Entity<T extends EntitySchema> {
  mesh: AbstractMesh;
  updator: T;

  moveSpeed = 0.01;
  rotateSpeed = 0.01;
  scaleSpeed = 0.01;

  serverPosition = new Vector3();
  serverQuaternion = new Quaternion();
  serverScale = new Vector3();

  elaspedTime = 0;
  patchInterval = 0;

  constructor(assetName: string, updator: T) {
    this.mesh = Managers.Resource.GetAsset(assetName).instantiateModelsToScene()
      .rootNodes[0] as AbstractMesh;
    this.updator = updator;

    this.mesh.position.set(
      updator.transform.position.x,
      updator.transform.position.y,
      updator.transform.position.z
    );
    this.mesh.rotationQuaternion.set(
      updator.transform.quaternion.x,
      updator.transform.quaternion.y,
      updator.transform.quaternion.z,
      updator.transform.quaternion.w
    );
    this.mesh.scaling.set(
      updator.transform.scale.x,
      updator.transform.scale.y,
      updator.transform.scale.z
    );
  }

  public SetPatchRate(milliseconds: number) {
    this.patchInterval = milliseconds;
  }

  abstract Update(delta: number);
  abstract Dispose();
}
