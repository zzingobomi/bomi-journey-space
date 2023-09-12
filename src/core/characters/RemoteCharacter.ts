import { Entity } from "../engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";
import { moveTowardsQuaternion, moveTowardsVector3 } from "../../Utils";
import {
  AbstractMesh,
  Matrix,
  MeshBuilder,
  Quaternion,
  Vector3,
} from "@babylonjs/core";

export class RemoteCharacter extends Entity<PlayerSchema> {
  deltaTime: number = 0;

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

    this.scene.registerBeforeRender(this.update.bind(this));
  }

  InitMesh() {
    const outer = MeshBuilder.CreateBox(
      "remoteCharacter",
      { width: 2, depth: 1, height: 3 },
      this.scene
    );
    outer.isVisible = false;
    outer.isPickable = false;
    outer.checkCollisions = true;

    outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

    outer.ellipsoid = new Vector3(1, 1.5, 1);
    outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

    outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

    this.rootMesh = outer;

    const mesh = this.rootNodes[0] as AbstractMesh;
    mesh.parent = this.rootMesh;
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m) => {
      m.isPickable = false;
    });

    this.mesh = mesh;

    this.SetInitialPosition();
  }

  private update() {
    this.deltaTime = this.engine.getDeltaTime();

    this.rootMesh.position = moveTowardsVector3(
      this.rootMesh.position,
      this.serverPosition,
      this.deltaTime * this.moveSpeed
    );
    this.rootMesh.rotationQuaternion = moveTowardsQuaternion(
      this.rootMesh.rotationQuaternion,
      this.serverQuaternion,
      this.deltaTime * this.rotateSpeed
    );
    this.rootMesh.scaling = moveTowardsVector3(
      this.rootMesh.scaling,
      this.serverScale,
      this.deltaTime * this.scaleSpeed
    );
  }

  Dispose() {
    console.log("remotecharacter dispose");
  }
}
