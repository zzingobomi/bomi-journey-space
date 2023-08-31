import { P2P } from "@src/p2p";
import { Room } from "@src/colyseus/Room";
import { RtcSocketEventType } from "./p2p/types";

export class App {
  room: Room;
  p2p: P2P;

  constructor() {
    this.room = new Room();

    this.p2p = new P2P(
      process.env.WS_SCHEME,
      process.env.WS_HOST,
      process.env.WS_PORT
    );
    this.p2p.Join("userroom1", "user");
    this.p2p.OnSocketConnected = (socketId: string) => {
      console.log(`${socketId} is connected`);
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
            console.log(state);
            break;
        }
      };
      // TODO: SendchannelOpen 때 하는게 맞는가?
      rtcSocket.OnSendChannelOpen = (ev: Event) => {
        console.log(`${rtcSocket.id} send channel open`);
      };
      rtcSocket.OnReceiveChannelMessage = (ev: MessageEvent<any>) => {
        PubSub.publish(RtcSocketEventType.ReceiveData, ev.data);
      };
    };
    this.p2p.OnRemoveRtcSocket = (id: string) => {
      console.log(`${id} rtc socket removed`);
    };
  }
}

new App();
