import { Entity } from "../engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";
import { moveTowardsQuaternion, moveTowardsVector3 } from "../../Utils";
import {
  AbstractMesh,
  Matrix,
  MeshBuilder,
  Quaternion,
  Scalar,
  Vector3,
} from "@babylonjs/core";
import { CharacterState } from "./MyCharacter";

export class RemoteCharacter extends Entity<PlayerSchema> {
  currentState: number = 0;
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

    for (const animationGroup of this.animationGroups) {
      animationGroup.play(true);
    }
    this.animationGroups[CharacterState.DASH].weight = 0.0;
    this.animationGroups[CharacterState.IDLE].weight = 1.0;
    this.animationGroups[CharacterState.RUN].weight = 0.0;

    this.SetInitialPosition();
  }

  private update() {
    this.deltaTime = this.engine.getDeltaTime();

    this.rootMesh.position = moveTowardsVector3(
      this.rootMesh.position,
      this.serverPosition,
      (this.deltaTime / 1000) * this.moveSpeed
    );
    this.rootMesh.rotationQuaternion = moveTowardsQuaternion(
      this.rootMesh.rotationQuaternion,
      this.serverQuaternion,
      (this.deltaTime / 1000) * this.rotateSpeed
    );
    this.rootMesh.scaling = moveTowardsVector3(
      this.rootMesh.scaling,
      this.serverScale,
      (this.deltaTime / 1000) * this.scaleSpeed
    );

    // TODO: 이동 보간때문에 상태를 바로 업데이트하면 애니메이션 동기화가 안맞는다..
    // 만약 달리기나 점프 또는 다른 상태는 어떻게 동기화를 맞출 것인가?
    if (this.rootMesh.position.equalsWithEpsilon(this.serverPosition)) {
      this.currentState = CharacterState.IDLE;
    } else {
      this.currentState = CharacterState.RUN;
    }

    this.switchAnimation(this.currentState);
  }

  private switchAnimation(state: CharacterState) {
    for (let i = 0; i < this.animationGroups.length; i++) {
      if (state === i) {
        this.animationGroups[i].weight += 0.005 * this.deltaTime;
      } else {
        this.animationGroups[i].weight -= 0.005 * this.deltaTime;
      }
      this.animationGroups[i].weight = Scalar.Clamp(
        this.animationGroups[i].weight,
        0.0,
        1.0
      );
    }
  }

  Dispose() {
    this.instanceModel.dispose();
    this.rootMesh.dispose();
    this.dispose();
  }
}
