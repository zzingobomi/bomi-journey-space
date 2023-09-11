import {
  Engine,
  Scene,
  Vector3,
  Quaternion,
  TransformNode,
  Node,
  Mesh,
  Skeleton,
  AnimationGroup,
  AbstractMesh,
} from "@babylonjs/core";
import { Managers } from "@src/managers/Managers";
import { EntitySchema } from "@src/schema/EntitySchema";

export abstract class Entity<T extends EntitySchema> extends TransformNode {
  engine: Engine;
  scene: Scene;

  rootMesh: Mesh;
  mesh: AbstractMesh;
  rootNodes: Node[];
  skeletons: Skeleton[];
  animationGroups: AnimationGroup[];

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
    super(assetName, Managers.Game.scene);
    this.engine = Managers.Game.engine;
    this.scene = Managers.Game.scene;
    this.updator = updator;

    const { rootNodes, skeletons, animationGroups } =
      Managers.Resource.GetAsset(assetName).instantiateModelsToScene();
    this.rootNodes = rootNodes;
    this.skeletons = skeletons;
    animationGroups.forEach((animationGroup, index) => {
      animationGroup.name = animationGroup.name.replace("Clone of ", "");
    });
    this.animationGroups = animationGroups;
  }

  abstract InitMesh();

  protected SetInitialPosition() {
    this.rootMesh.position.set(
      this.updator.transform.position.x,
      this.updator.transform.position.y,
      this.updator.transform.position.z
    );
    this.rootMesh.rotationQuaternion.set(
      this.updator.transform.quaternion.x,
      this.updator.transform.quaternion.y,
      this.updator.transform.quaternion.z,
      this.updator.transform.quaternion.w
    );
    this.rootMesh.scaling.set(
      this.updator.transform.scale.x,
      this.updator.transform.scale.y,
      this.updator.transform.scale.z
    );
  }

  public SetPatchRate(milliseconds: number) {
    this.patchInterval = milliseconds;
  }

  //abstract Update(delta: number);
  abstract Dispose();
}
