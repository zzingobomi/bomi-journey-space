import {
  Scene,
  TransformNode,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

export class PlayerCamera {
  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(
    0.5934119456780721,
    0,
    0
  );

  public camera: UniversalCamera;
  private scene: Scene;
  public camRoot: TransformNode;
  private yTilt: TransformNode;

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    this.camRoot = new TransformNode("root");
    this.camRoot.position = new Vector3(0, 0, 0);
    this.camRoot.rotation = new Vector3(0, Math.PI, 0);

    this.yTilt = new TransformNode("ytilt");
    this.yTilt.rotation = PlayerCamera.ORIGINAL_TILT;
    this.yTilt.parent = this.camRoot;

    this.camera = new UniversalCamera(
      "cam",
      new Vector3(0, 0, -30),
      this.scene
    );
    this.camera.lockedTarget = this.camRoot.position;
    this.camera.fov = 0.47350045992678597;
    this.camera.parent = this.yTilt;

    this.camera.attachControl();

    this.scene.activeCamera = this.camera;
  }
}
