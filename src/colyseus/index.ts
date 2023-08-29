import PubSub from "pubsub-js";
import { EventType } from "@src/shared/types";
import { Protocol } from "./Protocol";
import { State } from "./PlayerSchema";
import { SchemaSerializer } from "./SchemaSerializer";

export class Room {
  token: string;

  public serializerId: string;
  public serializer: SchemaSerializer<State> = new SchemaSerializer();

  constructor() {
    this.token = PubSub.subscribe(EventType.ReceiveData, (msg, data) =>
      this.onMessageCallback(data)
    );
  }

  private onMessageCallback(data) {
    const bytes = Array.from(new Uint8Array(data));
    const code = bytes[0];

    switch (code) {
      case Protocol.JOIN_ROOM:
        console.log("joinRoom");
        //this.hasJoined = true;
        //this.onJoin.invoke();

        // acknowledge successfull JOIN_ROOM
        //this.connection.send([Protocol.JOIN_ROOM]);
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
    console.log(this.serializer.getState());
    //this.onStateChange.invoke(this.serializer.getState());
  }
}
