import { GameRoomState } from "@src/network/GameRoomState";
import { Room } from "@src/network/Room";
import { Managers } from "./Managers";
import { Player } from "@src/network/PlayerSchema";

export class NetworkManager {
  room: Room<GameRoomState>;

  public Init(sessionId: string) {
    this.room = new Room<GameRoomState>(sessionId);
    this.room.OnJoin = this.join.bind(this);

    Managers.loading.HideLoadingUI();
  }

  private join() {
    this.room.state.players.onAdd(
      (playerUpdator: Player, sessionId: string) => {
        if (this.room.sessionId === sessionId) {
          Managers.Players.CreateMyPlayer(playerUpdator, sessionId);
        } else {
          Managers.Players.CreateRemotePlayer(playerUpdator, sessionId);
        }
      }
    );

    this.room.state.players.onRemove(
      (playerUpdator: Player, sessionId: string) => {
        Managers.Players.RemovePlayer(sessionId);
      }
    );
  }
}
