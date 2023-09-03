import { RtcSocketEventType } from "@src/p2p/P2PYypes";
import { SchemaSerializer } from "./SchemaSerializer";
import { RtcSocket } from "@src/p2p/RtcSocket";
import { Schema } from "@colyseus/schema";
import { Protocol } from "@src/shared/Protocol";
import { getMessageBytes } from "@src/Utils";
import PubSub from "pubsub-js";

export class Room<State extends Schema> {
  public sessionId: string;

  private serializer: SchemaSerializer<State> = new SchemaSerializer();

  private token: string;

  OnJoin?: () => void;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    // TODO: Pubsub 이 아니고.. manager 이용?
    this.token = PubSub.subscribe(
      RtcSocketEventType.ReceiveData,
      (msg, dataObj) => this._onMessageProtocol(dataObj)
    );
  }

  public get state(): State {
    return this.serializer.getState();
  }

  private _onMessageProtocol(dataObj: { rtcSocket: RtcSocket; data: any }) {
    const { rtcSocket, data } = dataObj;
    const bytes = Array.from(new Uint8Array(data));
    const code = bytes[0];

    switch (code) {
      case Protocol.JOIN_ROOM:
        console.log("joinRoom");

        let offset = 1;

        if (bytes.length > offset && this.serializer.handshake) {
          this.serializer.handshake(bytes, { offset });
        }

        if (this.OnJoin) this.OnJoin();

        rtcSocket.Send(getMessageBytes[Protocol.JOIN_ROOM]());
        break;
      case Protocol.ERROR:
        console.log("error");
        break;
      case Protocol.LEAVE_ROOM:
        console.log("leaveRoom");
        break;
      case Protocol.ROOM_DATA_SCHEMA:
        console.log("ROOM_DATA_SCHEMA");
        break;
      case Protocol.ROOM_STATE:
        console.log("ROOM_STATE");
        bytes.shift(); // drop `code` byte
        this.setState(bytes);
        break;
      case Protocol.ROOM_STATE_PATCH:
        console.log("ROOM_STATE_PATCH");
        bytes.shift(); // drop `code` byte
        this.patch(bytes);
        break;
      case Protocol.ROOM_DATA:
        console.log("ROOM_DATA");
        break;
      case Protocol.ROOM_DATA_BYTES:
        console.log("ROOM_DATA_BYTES");
        break;
    }
  }

  protected setState(encodedState: number[]): void {
    this.serializer.setState(encodedState);
    //this.onStateChange.invoke(this.serializer.getState());
  }

  protected patch(binaryPatch: number[]) {
    this.serializer.patch(binaryPatch);
    //this.onStateChange.invoke(this.serializer.getState());
  }
}
