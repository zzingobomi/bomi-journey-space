import {
  AssetsManager,
  AssetContainer,
  ContainerAssetTask,
  MeshAssetTask,
  Scene,
} from "@babylonjs/core";
import { Managers } from "./Managers";

export class ResourceManager {
  private assetsManager: AssetsManager;
  private loadedAssets: AssetContainer[] = [];

  public async LoadNavMesh() {}

  public GetLoadedAssets() {
    return this.loadedAssets;
  }

  public GetAsset(name: string) {
    return this.loadedAssets[name] as AssetContainer;
  }

  public async LoadAssets(scene: Scene) {
    this.assetsManager = new AssetsManager(scene);

    const environmentModelFile = "town.glb";
    const characterModelFile = "male.glb";
    const villageModelFile = "village.glb";
    const playerModelFile = "player.glb";

    const assetsToLoad = [
      {
        name: environmentModelFile.split(".")[0],
        filename: `${environmentModelFile}`,
        extension: environmentModelFile.split(".")[1],
        instantiate: true,
      },
      {
        name: characterModelFile.split(".")[0],
        filename: `${characterModelFile}`,
        extension: characterModelFile.split(".")[1],
        instantiate: true,
      },
      {
        name: villageModelFile.split(".")[0],
        filename: `${villageModelFile}`,
        extension: villageModelFile.split(".")[1],
        instantiate: true,
      },
      {
        name: playerModelFile.split(".")[0],
        filename: `${playerModelFile}`,
        extension: playerModelFile.split(".")[1],
        instantiate: true,
      },
    ];

    assetsToLoad.forEach((obj) => {
      let assetTask;
      switch (obj.extension) {
        case "babylon":
        case "gltf":
        case "glb":
        case "obj":
          if (obj.instantiate) {
            assetTask = this.assetsManager.addContainerTask(
              obj.name,
              "",
              process.env.STATIC_HOST,
              `${obj.filename}`
            );
          } else {
            assetTask = this.assetsManager.addMeshTask(
              obj.name,
              "",
              process.env.STATIC_HOST,
              `${obj.filename}`
            );
          }
          break;

        default:
          console.error(
            `Error loading asset ${obj.name}. Unrecognized file extension ${obj.extension}`
          );
      }

      assetTask.onSuccess = (task) => {
        switch (task.constructor) {
          case ContainerAssetTask:
            this.loadedAssets[task.name] = task.loadedContainer;
            break;
          case MeshAssetTask:
            this.loadedAssets[task.name] = task;
            break;
          default:
            console.log(
              `Error loading asset ${task.name}. Unrecognized AssetManager task type.`
            );
            break;
        }
      };

      assetTask.onError = (task, message, exception) => {
        console.log(message, exception);
      };
    });

    this.assetsManager.onProgress = (
      remainingCount,
      totalCount,
      lastFinishedTask
    ) => {
      const loadingMsg = `Resource Load ... ${(
        ((totalCount - remainingCount) / totalCount) *
        100
      ).toFixed(0)}%`;
      Managers.Loading.ShowLoadingDesc(loadingMsg);
    };

    this.assetsManager.onFinish = () => {
      Managers.Loading.ShowLoadingDesc("Resource Load 100%");
    };

    await this.assetsManager.loadAsync();
  }
}
