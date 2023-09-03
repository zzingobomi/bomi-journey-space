import { Scene, UniversalCamera, Vector3 } from "@babylonjs/core";

export class PlayerCamera {
  public camera: UniversalCamera;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    this.camera = new UniversalCamera("cam", new Vector3(0, 0, 0), this.scene);
    this.camera.fov = 0.75;
    this.camera.position = new Vector3(0, 35, 0);
    this.camera.setTarget(new Vector3(0, 0, 0));

    this.camera.attachControl();

    this.scene.activeCamera = this.camera;
  }
}
