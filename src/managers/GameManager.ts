import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_materials_pbrSpecularGlossiness";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

import {
  Engine,
  Scene,
  Color3,
  Color4,
  DirectionalLight,
  HemisphericLight,
  Vector3,
} from "@babylonjs/core";
import { Room } from "@src/network/Room";
import { Managers } from "@src/managers/Managers";
import { PlayerCamera } from "../core/engine/PlayerCamera";
import { GameRoomStateSchema } from "@src/schema/GameRoomStateSchema";
import Stats from "stats.js";

export class GameManager {
  // babylon
  public canvas: HTMLCanvasElement;
  public engine: Engine;
  public scene: Scene;
  public playerCamera: PlayerCamera;

  // network
  public room: Room<GameRoomStateSchema>;

  // Debug
  public stats: Stats;

  private previousTime = Date.now();

  constructor() {
    this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  }

  public async Init() {
    await this.initScene();
    await this.initEnvironment();
    await this.initResource();
    await this.initDebug();

    this.render();
  }

  private async initScene() {
    this.engine = new Engine(this.canvas, true, {
      adaptToDeviceRatio: true,
    });

    //const loadingScreen = new Loading();
    //this.engine.loadingScreen = loadingScreen;
    this.scene = new Scene(this.engine);
    this.playerCamera = new PlayerCamera(this.scene);
  }

  private async initEnvironment() {
    // sky
    this.scene.clearColor = new Color4(255, 255, 255, 1);

    // ambient light
    const ambientLight = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      this.scene
    );
    ambientLight.intensity = 1;
    ambientLight.groundColor = new Color3(0.13, 0.13, 0.13);
    ambientLight.specular = Color3.Black();

    // fog
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 60.0;
    this.scene.fogEnd = 120.0;
    this.scene.fogColor = new Color3(0.9, 0.9, 0.85);

    // directional light
    const light = new DirectionalLight(
      "DirectionalLight",
      new Vector3(-1, -2, -1),
      this.scene
    );
    light.position = new Vector3(100, 100, 100);
    light.radius = 0.27;
    light.intensity = 2.5;
    light.autoCalcShadowZBounds = true;
  }

  private async initResource() {
    await Managers.Resource.LoadAssets(this.scene);
    const townInstance =
      Managers.Resource.GetAsset("town").instantiateModelsToScene();
  }

  private async initDebug() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  private update(delta: number) {
    Managers.Instance.Update(delta);
  }

  private render() {
    this.engine.runRenderLoop(() => {
      if (this.scene && this.scene.activeCamera) {
        this.stats.begin();

        const now = Date.now();
        const delta = now - this.previousTime;

        this.update(delta);
        this.scene.render();

        this.previousTime = now;

        this.stats.end();
      }
    });
  }
}
