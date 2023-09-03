import { Room } from "@src/network/Room";
import { Managers } from "./Managers";

import { RtcSocket } from "@src/p2p/RtcSocket";
import { GameRoomStateSchema } from "@src/schema/GameRoomStateSchema";
import { PlayerSchema } from "@src/schema/PlayerSchema";

export class NetworkManager {
  room: Room<GameRoomStateSchema>;
  serverRtcSocket: RtcSocket;

  public Init(sessionId: string) {
    this.room = new Room<GameRoomStateSchema>(sessionId);
    this.room.OnJoin = this.join.bind(this);

    Managers.Loading.HideLoadingUI();
  }

  public SetServerRtcSocket(rtcSocket: RtcSocket) {
    this.serverRtcSocket = rtcSocket;
  }

  public Send(data: any) {
    this.serverRtcSocket.Send(data);
  }

  private join() {
    this.room.state.players.onAdd(
      (updator: PlayerSchema, sessionId: string) => {
        if (this.room.sessionId === sessionId) {
          Managers.Players.CreateMyPlayer(updator, sessionId);
        } else {
          Managers.Players.CreateRemotePlayer(updator, sessionId);
        }
      }
    );

    this.room.state.players.onRemove(
      (updator: PlayerSchema, sessionId: string) => {
        Managers.Players.RemovePlayer(sessionId);
      }
    );
  }
}
