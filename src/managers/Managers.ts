import { GameManager } from "@src/managers/GameManager";
import { PlayerManager } from "./PlayerManager";
import { ResourceManager } from "./ResourceManager";
import { P2PManager } from "./P2PManager";
import { LoadingManager } from "./LooadingManager";
import { NetworkManager } from "./NetworkManager";
import { InputManager } from "./InputManager";

export class Managers {
  private static s_instance: Managers;
  static get Instance(): Managers {
    this.Init();
    return this.s_instance;
  }

  _game: GameManager = new GameManager();
  _input: InputManager = new InputManager();
  _p2p: P2PManager = new P2PManager();
  _network: NetworkManager = new NetworkManager();
  _loading: LoadingManager = new LoadingManager();
  _resource: ResourceManager = new ResourceManager();
  _players: PlayerManager = new PlayerManager();

  static get Game(): GameManager {
    return Managers.Instance._game;
  }
  static get Input(): InputManager {
    return Managers.Instance._input;
  }
  static get P2P(): P2PManager {
    return Managers.Instance._p2p;
  }
  static get Network(): NetworkManager {
    return Managers.Instance._network;
  }
  static get Loading(): LoadingManager {
    return Managers.Instance._loading;
  }
  static get Resource(): ResourceManager {
    return Managers.Instance._resource;
  }
  static get Players(): PlayerManager {
    return Managers.Instance._players;
  }

  public Update(delta: number): void {
    this._input.Update(delta);
    this._players.Update(delta);
  }

  static async Init() {
    if (!this.s_instance) {
      this.s_instance = new Managers();

      await this.s_instance._game.Init();
      this.s_instance._p2p.Init();
    }
  }

  public static Clear(): void {
    this.Input.Dispose();
  }
}
