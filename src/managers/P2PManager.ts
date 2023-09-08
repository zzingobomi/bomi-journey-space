import { P2P } from "@src/p2p/P2P";
import { RtcSocketEventType } from "@src/p2p/P2PTypes";
import { Managers } from "./Managers";

export class P2PManager {
  p2p: P2P;

  public Init() {
    Managers.Loading.ShowLoadingDesc("P2P Connection ...");

    this.p2p = new P2P(
      process.env.WS_SCHEME,
      process.env.WS_HOST,
      process.env.WS_PORT
    );
    // TODO: roomId 받아오기
    this.p2p.Join("userroom1", "user");
    this.p2p.OnSocketConnected = (socketId: string) => {
      console.log(`${socketId} is connected`);
      Managers.Network.Init(socketId);
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
      rtcSocket.OnSendChannelOpen = (ev: Event) => {
        console.log(`${rtcSocket.id} send channel open`);
        Managers.Network.SetServerRtcSocket(rtcSocket);
      };
      rtcSocket.OnReceiveChannelOpen = (ev: Event) => {
        console.log(`${rtcSocket.id} receive channel open`);
      };
      rtcSocket.OnReceiveChannelMessage = (ev: MessageEvent<any>) => {
        // TODO: pubusb 안쓰고 수정할것...
        PubSub.publish(RtcSocketEventType.ReceiveData, {
          rtcSocket,
          data: ev.data,
        });
      };
    };
    this.p2p.OnRemoveRtcSocket = (id: string) => {
      console.log(`${id} rtc socket removed`);
    };

    // window.addEventListener("keydown", (event) => {
    //   if (event.key === "ArrowUp") {
    //     this.p2p
    //       .GetAllRtcSockets()[0]
    //       .Send(JSON.stringify({ eventType: "move", data: { y: -1 } }));
    //   } else if (event.key === "ArrowRight") {
    //     this.p2p
    //       .GetAllRtcSockets()[0]
    //       .Send(JSON.stringify({ eventType: "move", data: { x: 1 } }));
    //   } else if (event.key === "ArrowDown") {
    //     this.p2p
    //       .GetAllRtcSockets()[0]
    //       .Send(JSON.stringify({ eventType: "move", data: { y: 1 } }));
    //   } else if (event.key === "ArrowLeft") {
    //     this.p2p
    //       .GetAllRtcSockets()[0]
    //       .Send(JSON.stringify({ eventType: "move", data: { x: -1 } }));
    //   }
    // });
  }
}
