import { Room } from "@src/network/Room";

import { GameRoomStateSchema } from "@src/schema/GameRoomStateSchema";

export class TestGameManager {
  // network
  public room: Room<GameRoomStateSchema>;

  constructor() {}

  public async Init() {
    window.addEventListener("keydown", (ev) => {
      console.log(ev);
    });
  }
}
