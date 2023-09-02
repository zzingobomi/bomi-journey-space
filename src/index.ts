import { P2P } from "@src/p2p";
import { Room } from "@src/colyseus/Room";
import { RtcSocketEventType } from "./p2p/types";
import { Player } from "./colyseus/PlayerSchema";
import { GameRoomState } from "./colyseus/GameRoomState";
import { Managers } from "./managers/Managers";

export class App {
  room: Room<GameRoomState>;
  p2p: P2P;

  constructor() {
    this.p2p = new P2P(
      process.env.WS_SCHEME,
      process.env.WS_HOST,
      process.env.WS_PORT
    );
    this.p2p.Join("userroom1", "user");
    this.p2p.OnSocketConnected = (socketId: string) => {
      console.log(`${socketId} is connected`);
      this.room = new Room<GameRoomState>(this.p2p.socket.id);
      this.room.OnJoin = this.join.bind(this);
    };
    this.p2p.OnAddRtcSocket = (id: string) => {
      const rtcSocket = this.p2p.GetRtcSocket(id);
      rtcSocket.OnConnectionStateChange = (ev: Event) => {
        const state = (ev.currentTarget as RTCPeerConnection).connectionState;
        switch (state) {
          case "connected":
            console.log(`${rtcSocket.id} is connected`);
            break;
          case "disconnected":
            console.log(`${rtcSocket.id} is disconnected`);
            break;
          default:
            console.log(`${rtcSocket.id} is ${state}`);
            break;
        }
      };
      // TODO: SendchannelOpen 때 하는게 맞는가?
      rtcSocket.OnSendChannelOpen = (ev: Event) => {
        console.log(`${rtcSocket.id} send channel open`);
      };
      rtcSocket.OnReceiveChannelMessage = (ev: MessageEvent<any>) => {
        PubSub.publish(RtcSocketEventType.ReceiveData, {
          rtcSocket,
          data: ev.data,
        });
      };
    };
    this.p2p.OnRemoveRtcSocket = (id: string) => {
      console.log(`${id} rtc socket removed`);
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.p2p
          .GetAllRtcSockets()[0]
          .Send(JSON.stringify({ eventType: "move", data: { y: -1 } }));
      } else if (event.key === "ArrowRight") {
        this.p2p
          .GetAllRtcSockets()[0]
          .Send(JSON.stringify({ eventType: "move", data: { x: 1 } }));
      } else if (event.key === "ArrowDown") {
        this.p2p
          .GetAllRtcSockets()[0]
          .Send(JSON.stringify({ eventType: "move", data: { y: 1 } }));
      } else if (event.key === "ArrowLeft") {
        this.p2p
          .GetAllRtcSockets()[0]
          .Send(JSON.stringify({ eventType: "move", data: { x: -1 } }));
      }
    });
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

new App();
