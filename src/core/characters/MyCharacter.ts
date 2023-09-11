import { Managers } from "@src/managers/Managers";
import { Entity } from "../engine/Entity";
import { PlayerSchema } from "@src/schema/PlayerSchema";
import { Protocol } from "@src/shared/Protocol";
import { KeyboardCode, getMessageBytes, moveTowardsVector3 } from "@src/Utils";
import {
  AbstractMesh,
  Matrix,
  MeshBuilder,
  Quaternion,
  Vector3,
  Scalar,
  DeviceSourceManager,
  DeviceSource,
  DeviceType,
  IPointerEvent,
  PickingInfo,
  PointerEventTypes,
  Ray,
  Tools,
} from "@babylonjs/core";

enum CharacterState {
  DASH = 0,
  IDLE,
  JUMP,
  LAND,
  RUN,
}

export class MyCharacter extends Entity<PlayerSchema> {
  private static readonly PLAYER_SPEED: number = 0.45;
  private static readonly GRAVITY: number = -2.8;
  private static readonly JUMP_FORCE: number = 0.8;
  private static readonly MOUSE_SENSITIVITY: number = 0.003;
  private static readonly CAMERA_SPEED: number = 0.05;
  private static readonly MOUSE_Y_MIN: number = -35;
  private static readonly MOUSE_Y_MAX: number = 45;

  dsm: DeviceSourceManager;

  horizontal: number = 0;
  vertical: number = 0;

  horizontalAxis: number = 0;
  verticalAxis: number = 0;

  jumpKeyDown: boolean = false;
  runKeyDown: boolean = false;

  moveDirection: Vector3 = new Vector3();
  inputAmt: number;

  gravity: Vector3 = new Vector3();
  lastGroundPos: Vector3 = Vector3.Zero();
  grounded: boolean;
  jumpCount: number = 1;

  currentState: CharacterState = CharacterState.IDLE;

  mouseX: number = 0;
  mouseY: number = 0;

  constructor(assetName: string, updator: PlayerSchema) {
    super(assetName, updator);

    this.dsm = new DeviceSourceManager(this.engine);

    this.SetPatchRate(1000 / 20);

    this.scene.registerBeforeRender(this.update.bind(this));
    this.scene.onPointerMove = this.mouseMove.bind(this);
  }

  InitMesh() {
    const outer = MeshBuilder.CreateBox(
      "myCharacter",
      { width: 2, depth: 1, height: 3 },
      this.scene
    );
    outer.isVisible = false;
    outer.isPickable = false;
    outer.checkCollisions = true;

    outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

    outer.ellipsoid = new Vector3(1, 1.5, 1);
    outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

    outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

    this.rootMesh = outer;
    this.rootMesh.parent = this;

    const mesh = this.rootNodes[0] as AbstractMesh;
    mesh.parent = this.rootMesh;
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m) => {
      m.isPickable = false;
    });

    this.mesh = mesh;

    for (const animationGroup of this.animationGroups) {
      animationGroup.play(true);
    }
    this.animationGroups[CharacterState.DASH].weight = 0.0;
    this.animationGroups[CharacterState.IDLE].weight = 1.0;
    this.animationGroups[CharacterState.RUN].weight = 0.0;

    this.SetInitialPosition();
  }

  private update() {
    const deltaTime = this.engine.getDeltaTime() / 1000.0;
    const keyboard = this.dsm.getDeviceSource(DeviceType.Keyboard);
    const mouse = this.dsm.getDeviceSource(DeviceType.Mouse);

    this.currentState = CharacterState.IDLE;

    if (keyboard) {
      this.updateFromKeyboard(keyboard);
    }
    if (mouse) {
    }

    this.updateFromControls(deltaTime);
    this.updateGroundDetection(deltaTime);
    this.updateCamera();

    this.switchAnimation(this.currentState);
  }

  private updateFromKeyboard(keyboard: DeviceSource<DeviceType.Keyboard>) {
    if (keyboard.getInput(KeyboardCode.KEY_W)) {
      this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
      this.verticalAxis = 1;
    } else if (keyboard.getInput(KeyboardCode.KEY_S)) {
      this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
      this.verticalAxis = -1;
    } else {
      this.vertical = 0;
      this.verticalAxis = 0;
    }

    if (keyboard.getInput(KeyboardCode.KEY_A)) {
      this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
      this.horizontalAxis = -1;
    } else if (keyboard.getInput(KeyboardCode.KEY_D)) {
      this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
      this.horizontalAxis = 1;
    } else {
      this.horizontal = 0;
      this.horizontalAxis = 0;
    }

    if (keyboard.getInput(KeyboardCode.KEY_SHIFT)) {
      this.runKeyDown = true;
    } else {
      this.runKeyDown = false;
    }

    if (keyboard.getInput(KeyboardCode.KEY_SPACE)) {
      this.jumpKeyDown = true;
    } else {
      this.jumpKeyDown = false;
    }
  }

  private updateFromControls(deltaTime: number) {
    this.moveDirection = Vector3.Zero();

    let fwd = Managers.Game.playerCamera.camRoot.forward;
    let right = Managers.Game.playerCamera.camRoot.right;
    let correctedVertical = fwd.scaleInPlace(this.vertical);
    let correctedHorizontal = right.scaleInPlace(this.horizontal);

    let move = correctedHorizontal.addInPlace(correctedVertical);

    this.moveDirection = new Vector3(move.normalize().x, 0, move.normalize().z);

    let inputMag = Math.abs(this.horizontal) + Math.abs(this.vertical);
    if (inputMag < 0) {
      this.inputAmt = 0;
    } else if (inputMag > 1) {
      this.inputAmt = 1;
    } else {
      this.inputAmt = inputMag;
    }

    this.moveDirection = this.moveDirection.scaleInPlace(
      this.inputAmt * MyCharacter.PLAYER_SPEED
    );

    let input = new Vector3(this.horizontalAxis, 0, this.verticalAxis);
    if (input.length() === 0) {
      this.currentState = CharacterState.IDLE;
      return;
    }

    this.currentState = CharacterState.RUN;

    let angle = Math.atan2(this.horizontalAxis, this.verticalAxis);
    angle += Managers.Game.playerCamera.camRoot.rotation.y;
    let targ = Quaternion.FromEulerAngles(0, angle, 0);
    this.rootMesh.rotationQuaternion = Quaternion.Slerp(
      this.rootMesh.rotationQuaternion,
      targ,
      10 * deltaTime
    );
  }

  private updateGroundDetection(deltaTime: number) {
    if (!this.isGrounded()) {
      if (this.checkSlope() && this.gravity.y <= 0) {
        console.log("slope");
        this.gravity.y = 0;
        this.jumpCount = 1;
        this.grounded = true;
      } else {
        this.gravity = this.gravity.addInPlace(
          Vector3.Up().scale(deltaTime * MyCharacter.GRAVITY)
        );
        this.grounded = false;
      }
    }

    if (this.gravity.y < -MyCharacter.JUMP_FORCE) {
      this.gravity.y = -MyCharacter.JUMP_FORCE;
    }

    this.rootMesh.moveWithCollisions(
      this.moveDirection.addInPlace(this.gravity)
    );

    if (this.isGrounded()) {
      this.gravity.y = 0;
      this.grounded = true;
      this.lastGroundPos.copyFrom(this.rootMesh.position);

      this.jumpCount = 1;
    }

    if (this.jumpKeyDown && this.jumpCount > 0) {
      this.gravity.y = MyCharacter.JUMP_FORCE;
      this.jumpCount--;
    }
  }

  private updateCamera() {
    const deltaTime = this.engine.getDeltaTime();
    let centerPlayer = this.rootMesh.position.y + 2;
    Managers.Game.playerCamera.camRoot.position = Vector3.Lerp(
      Managers.Game.playerCamera.camRoot.position,
      new Vector3(
        this.rootMesh.position.x,
        centerPlayer,
        this.rootMesh.position.z
      ),
      0.4
    );

    Managers.Game.playerCamera.camRoot.rotation = moveTowardsVector3(
      Managers.Game.playerCamera.camRoot.rotation,
      new Vector3(
        Tools.ToRadians(this.mouseY),
        Tools.ToRadians(this.mouseX),
        0
      ),
      MyCharacter.CAMERA_SPEED * deltaTime
    );
  }

  private mouseMove(
    evt: IPointerEvent,
    pickInfo: PickingInfo,
    type: PointerEventTypes
  ) {
    if (document.pointerLockElement === Managers.Game.canvas) {
      const deltaTime = this.engine.getDeltaTime();

      this.mouseX += evt.movementX * MyCharacter.MOUSE_SENSITIVITY * deltaTime;
      this.mouseY += evt.movementY * MyCharacter.MOUSE_SENSITIVITY * deltaTime;
      this.mouseY = Scalar.Clamp(
        this.mouseY,
        MyCharacter.MOUSE_Y_MIN,
        MyCharacter.MOUSE_Y_MAX
      );
    }
  }

  private switchAnimation(state: CharacterState) {
    const delta = this.engine.getDeltaTime();
    for (let i = 0; i < this.animationGroups.length; i++) {
      if (state === i) {
        this.animationGroups[i].weight += 0.005 * delta;
      } else {
        this.animationGroups[i].weight -= 0.005 * delta;
      }
      this.animationGroups[i].weight = Scalar.Clamp(
        this.animationGroups[i].weight,
        0.0,
        1.0
      );
    }
  }

  private isGrounded() {
    if (this.floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
      return false;
    } else {
      return true;
    }
  }

  private floorRaycast(offsetx: number, offsetz: number, raycastlen: number) {
    const raycastFloorPos = new Vector3(
      this.rootMesh.position.x + offsetx,
      this.rootMesh.position.y + 0.5,
      this.rootMesh.position.z + offsetz
    );
    const ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

    const predicate = (mesh: AbstractMesh) => {
      return mesh.isPickable && mesh.isEnabled();
    };

    const pick = this.scene.pickWithRay(ray, predicate);

    if (pick.hit) {
      return pick.pickedPoint;
    } else {
      return Vector3.Zero();
    }
  }

  private checkSlope() {
    const predicate = (mesh: AbstractMesh) => {
      return mesh.isPickable && mesh.isEnabled();
    };

    // 4 raycasts outward from center
    const raycast = new Vector3(
      this.mesh.position.x,
      this.mesh.position.y + 0.5,
      this.mesh.position.z + 0.25
    );
    const ray = new Ray(raycast, Vector3.Up().scale(-1), 1.5);
    const pick = this.scene.pickWithRay(ray, predicate);

    const raycast2 = new Vector3(
      this.mesh.position.x,
      this.mesh.position.y + 0.5,
      this.mesh.position.z - 0.25
    );
    const ray2 = new Ray(raycast2, Vector3.Up().scale(-1), 1.5);
    const pick2 = this.scene.pickWithRay(ray2, predicate);

    const raycast3 = new Vector3(
      this.mesh.position.x + 0.25,
      this.mesh.position.y + 0.5,
      this.mesh.position.z
    );
    const ray3 = new Ray(raycast3, Vector3.Up().scale(-1), 1.5);
    const pick3 = this.scene.pickWithRay(ray3, predicate);

    const raycast4 = new Vector3(
      this.mesh.position.x - 0.25,
      this.mesh.position.y + 0.5,
      this.mesh.position.z
    );
    const ray4 = new Ray(raycast4, Vector3.Up().scale(-1), 1.5);
    const pick4 = this.scene.pickWithRay(ray4, predicate);

    if (pick.hit && !pick.getNormal().equals(Vector3.Up())) {
      if (pick.pickedMesh.name.includes("stair")) {
        return true;
      }
    } else if (pick2.hit && !pick2.getNormal().equals(Vector3.Up())) {
      if (pick2.pickedMesh.name.includes("stair")) {
        return true;
      }
    } else if (pick3.hit && !pick3.getNormal().equals(Vector3.Up())) {
      if (pick3.pickedMesh.name.includes("stair")) {
        return true;
      }
    } else if (pick4.hit && !pick4.getNormal().equals(Vector3.Up())) {
      if (pick4.pickedMesh.name.includes("stair")) {
        return true;
      }
    }
    return false;
  }

  //Update(delta: number) {
  // let change = false;
  // if (this.actions.up.isPressed) {
  //   this.mesh.position.set(
  //     this.mesh.position.x,
  //     this.mesh.position.y,
  //     this.mesh.position.z + delta * this.moveSpeed
  //   );
  //   change = true;
  // }
  // if (this.actions.down.isPressed) {
  //   this.mesh.position.set(
  //     this.mesh.position.x,
  //     this.mesh.position.y,
  //     this.mesh.position.z - delta * this.moveSpeed
  //   );
  //   change = true;
  // }
  // if (this.actions.left.isPressed) {
  //   this.mesh.position.set(
  //     this.mesh.position.x + delta * this.moveSpeed,
  //     this.mesh.position.y,
  //     this.mesh.position.z
  //   );
  //   change = true;
  // }
  // if (this.actions.right.isPressed) {
  //   this.mesh.position.set(
  //     this.mesh.position.x - delta * this.moveSpeed,
  //     this.mesh.position.y,
  //     this.mesh.position.z
  //   );
  //   change = true;
  // }
  // this.elaspedTime += delta;
  // if (this.elaspedTime >= this.patchInterval) {
  //   // TODO: 변화 없으면 보내지 않기.. 키 입력으로 change 체크? 스스로 움직이는 것도 있는데?
  //   // 우선은 키입력으로 판단하자
  //   if (change) {
  //     Managers.Network.Send(
  //       getMessageBytes[Protocol.ENTITY_POSITION](this.mesh.position)
  //     );
  //     Managers.Network.Send(
  //       getMessageBytes[Protocol.ENTITY_QUATERNION](
  //         this.mesh.rotationQuaternion
  //       )
  //     );
  //     Managers.Network.Send(
  //       getMessageBytes[Protocol.ENTITY_SCALE](this.mesh.scaling)
  //     );
  //   }
  //   this.elaspedTime = 0;
  // }
  //}

  Dispose() {
    console.log("mycharacter dispose");
  }
}
