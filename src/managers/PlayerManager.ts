import { Player } from "@src/colyseus/PlayerSchema";

const colors = ["red", "green", "yellow", "blue", "cyan", "magenta"];

export interface PlayerInfo {
  sessionId: string;
  isMine: boolean;
  playerUpdator: Player;
  character: HTMLDivElement;
}

export class PlayerManager {
  players: PlayerInfo[] = [];
  myPlayer: PlayerInfo;

  public async CreateMyPlayer(playerUpdator: Player, sessionId: string) {
    console.log("myPlayer", sessionId);

    const myCharacter = document.createElement("div");
    myCharacter.className = "player";
    myCharacter.style.left = playerUpdator.x + "px";
    myCharacter.style.top = playerUpdator.y + "px";
    myCharacter.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    myCharacter.innerText = "Player " + sessionId;
    document.body.appendChild(myCharacter);

    playerUpdator.onChange(() => {
      myCharacter.style.left = playerUpdator.x + "px";
      myCharacter.style.top = playerUpdator.y + "px";
    });

    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      playerUpdator,
      character: myCharacter,
    };
    this.players.push(info);
    this.myPlayer = info;
  }

  public async CreateRemotePlayer(playerUpdator: Player, sessionId: string) {
    console.log("remotePlayer", sessionId);

    const remoteCharacter = document.createElement("div");
    remoteCharacter.className = "player";
    remoteCharacter.style.left = playerUpdator.x + "px";
    remoteCharacter.style.top = playerUpdator.y + "px";
    remoteCharacter.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    remoteCharacter.innerText = "Player " + sessionId;
    document.body.appendChild(remoteCharacter);

    playerUpdator.onChange(() => {
      remoteCharacter.style.left = playerUpdator.x + "px";
      remoteCharacter.style.top = playerUpdator.y + "px";
    });

    const info: PlayerInfo = {
      sessionId,
      isMine: true,
      playerUpdator,
      character: remoteCharacter,
    };
    this.players.push(info);
  }

  public RemovePlayer(sessionId: string) {
    const removeIndex = this.players.findIndex(
      (player) => player.sessionId === sessionId
    );
    if (removeIndex !== -1) {
      document.body.removeChild(this.players[removeIndex].character);
      this.players.splice(removeIndex, 1);
    }
  }
}
