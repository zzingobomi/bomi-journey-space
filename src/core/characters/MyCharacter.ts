import { Managers } from "@src/managers/Managers";
import { KeyBinding } from "../engine/KeyBinding";
import { IInputReceiver } from "../interfaces/IInputReceiver";
import { Entity } from "../engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";
import { Protocol } from "@src/shared/Protocol";
import { getMessageBytes } from "@src/Utils";

export class MyCharacter
  extends Entity<PlayerSchema>
  implements IInputReceiver
{
  actions: { [action: string]: KeyBinding };

  constructor(assetName: string, updator: PlayerSchema) {
    super(assetName, updator);

    this.actions = {
      // Movement
      up: new KeyBinding("KeyW"),
      down: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      run: new KeyBinding("ShiftLeft"),
      jump: new KeyBinding("Space"),
    };

    this.SetPatchRate(1000 / 20);
    Managers.Input.SetInputReceiver(this);
  }

  Update(delta: number) {
    let change = false;
    if (this.actions.up.isPressed) {
      this.mesh.position.set(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z + delta * this.moveSpeed
      );
      change = true;
    }
    if (this.actions.down.isPressed) {
      this.mesh.position.set(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z - delta * this.moveSpeed
      );
      change = true;
    }
    if (this.actions.left.isPressed) {
      this.mesh.position.set(
        this.mesh.position.x + delta * this.moveSpeed,
        this.mesh.position.y,
        this.mesh.position.z
      );
      change = true;
    }
    if (this.actions.right.isPressed) {
      this.mesh.position.set(
        this.mesh.position.x - delta * this.moveSpeed,
        this.mesh.position.y,
        this.mesh.position.z
      );
      change = true;
    }

    this.elaspedTime += delta;
    if (this.elaspedTime >= this.patchInterval) {
      // TODO: 변화 없으면 보내지 않기.. 키 입력으로 change 체크? 스스로 움직이는 것도 있는데?
      // 우선은 키입력으로 판단하자
      if (change) {
        Managers.Network.Send(
          getMessageBytes[Protocol.ENTITY_POSITION](this.mesh.position)
        );
        Managers.Network.Send(
          getMessageBytes[Protocol.ENTITY_QUATERNION](
            this.mesh.rotationQuaternion
          )
        );
        Managers.Network.Send(
          getMessageBytes[Protocol.ENTITY_SCALE](this.mesh.scaling)
        );
      }

      this.elaspedTime = 0;
    }
  }
  Dispose() {
    console.log("mycharacter dispose");
  }

  private triggerAction(actionName: string, value: boolean) {
    let action = this.actions[actionName];

    if (action.isPressed !== value) {
      action.isPressed = value;

      action.justPressed = false;
      action.justReleased = false;

      if (value) action.justPressed = true;
      else action.justReleased = true;

      // TODO: this.charState.OnInputChange();

      action.justPressed = false;
      action.justReleased = false;
    }
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        const binding = this.actions[action];

        if (binding.eventCodes.includes(code)) {
          this.triggerAction(action, pressed);
        }
      }
    }
  }
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {}
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {}
  handleMouseWheel(event: WheelEvent, value: number): void {}
  inputReceiverInit(): void {}
  inputReceiverUpdate(delta: number): void {}
}
