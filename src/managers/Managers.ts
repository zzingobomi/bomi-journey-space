import { PlayerManager } from "./PlayerManager";

export class Managers {
  private static s_instance: Managers;
  static get Instance(): Managers {
    this.Init();
    return this.s_instance;
  }

  _players: PlayerManager = new PlayerManager();

  static get Players(): PlayerManager {
    return Managers.Instance._players;
  }

  static Init(): void {
    if (!this.s_instance) {
      this.s_instance = new Managers();

      // TODO: 다른 매니저들 초기화
    }
  }

  public static Clear(): void {}
}
