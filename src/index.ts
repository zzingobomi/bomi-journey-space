import { P2P } from "./p2p";
import { Room } from "../src/colyseus";

export class App {
  room: Room;
  p2p: P2P;

  constructor() {
    this.room = new Room();

    this.p2p = new P2P();
    this.p2p.Init();
  }
}

new App();
