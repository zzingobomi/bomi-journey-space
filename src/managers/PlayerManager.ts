import { MyCharacter } from "@src/core/characters/MyCharacter";
import { RemoteCharacter } from "@src/core/characters/RemoteCharacter";
import { Entity } from "@src/core/engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";

export interface PlayerInfo {
  sessionId: string;
  isMine: boolean;
  character: Entity<PlayerSchema>;
}

export class PlayerManager {
  players: PlayerInfo[] = [];
  myPlayer: PlayerInfo;

  public Update(delta: number): void {
    for (const player of this.players) {
      player.character.Update(delta);
    }
  }

  public async CreateMyPlayer(updator: PlayerSchema, sessionId: string) {
    console.log("myPlayer", sessionId);

    const myCharacter = new MyCharacter("player", updator);

    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      character: myCharacter,
    };
    this.players.push(info);
    this.myPlayer = info;
  }

  public async CreateRemotePlayer(updator: PlayerSchema, sessionId: string) {
    console.log("remotePlayer", sessionId);

    const remoteCharacter = new RemoteCharacter("player", updator);

    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      character: remoteCharacter,
    };
    this.players.push(info);
  }

  public RemovePlayer(sessionId: string) {
    const removeIndex = this.players.findIndex(
      (player) => player.sessionId === sessionId
    );
    if (removeIndex !== -1) {
      this.players[removeIndex].character.Dispose();
      this.players.splice(removeIndex, 1);
    }
  }
}
