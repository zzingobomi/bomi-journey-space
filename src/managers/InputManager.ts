import { IInputReceiver } from "@src/core/interfaces/IInputReceiver";

export class InputManager {
  domElement: HTMLDivElement;
  pointerLock: boolean;
  isLocked: boolean;
  inputReceiver: IInputReceiver;

  boundOnMouseDown: (evt: any) => void;
  boundOnMouseMove: (evt: any) => void;
  boundOnMouseUp: (evt: any) => void;
  boundOnMouseWheelMove: (evt: any) => void;
  boundOnPointerlockChange: (evt: any) => void;
  boundOnPointerlockError: (evt: any) => void;
  boundOnKeyDown: (evt: any) => void;
  boundOnKeyUp: (evt: any) => void;

  constructor() {
    this.domElement = document.querySelector("#game-canvas") as HTMLDivElement;
    this.pointerLock = true; // TODO: 외부에서 속성값으로 수정 가능하도록
    this.isLocked = false;

    // Bindings for later event use
    // Mouse
    this.boundOnMouseDown = (evt) => this.onMouseDown(evt);
    this.boundOnMouseMove = (evt) => this.onMouseMove(evt);
    this.boundOnMouseUp = (evt) => this.onMouseUp(evt);
    this.boundOnMouseWheelMove = (evt) => this.onMouseWheelMove(evt);

    // Pointer lock
    this.boundOnPointerlockChange = (evt) => this.onPointerlockChange(evt);
    this.boundOnPointerlockError = (evt) => this.onPointerlockError(evt);

    // Keys
    this.boundOnKeyDown = (evt) => this.onKeyDown(evt);
    this.boundOnKeyUp = (evt) => this.onKeyUp(evt);

    // Init event listeners
    // Mouse
    this.domElement.addEventListener("mousedown", this.boundOnMouseDown, false);
    document.addEventListener("wheel", this.boundOnMouseWheelMove, false);
    document.addEventListener(
      "pointerlockchange",
      this.boundOnPointerlockChange,
      false
    );
    document.addEventListener(
      "pointerlockerror",
      this.boundOnPointerlockError,
      false
    );

    // Keys
    document.addEventListener("keydown", this.boundOnKeyDown, false);
    document.addEventListener("keyup", this.boundOnKeyUp, false);
  }

  public Dispose(): void {
    // Mouse
    this.domElement.removeEventListener(
      "mousedown",
      this.boundOnMouseDown,
      false
    );
    document.removeEventListener("wheel", this.boundOnMouseWheelMove, false);
    document.removeEventListener(
      "pointerlockchange",
      this.boundOnPointerlockChange,
      false
    );
    document.removeEventListener(
      "pointerlockerror",
      this.boundOnPointerlockError,
      false
    );

    // Keys
    document.removeEventListener("keydown", this.boundOnKeyDown, false);
    document.removeEventListener("keyup", this.boundOnKeyUp, false);
  }

  public Update(delta: number): void {
    this.inputReceiver?.inputReceiverUpdate(delta);
  }

  public SetInputReceiver(receiver: IInputReceiver): void {
    this.inputReceiver = receiver;
    this.inputReceiver.inputReceiverInit();
  }

  public SetPointerLock(enabled: boolean): void {
    this.pointerLock = enabled;
  }

  private onPointerlockChange(event: MouseEvent): void {
    if (document.pointerLockElement === this.domElement) {
      this.domElement.addEventListener(
        "mousemove",
        this.boundOnMouseMove,
        false
      );
      this.domElement.addEventListener("mouseup", this.boundOnMouseUp, false);
      this.isLocked = true;
    } else {
      this.domElement.removeEventListener(
        "mousemove",
        this.boundOnMouseMove,
        false
      );
      this.domElement.removeEventListener(
        "mouseup",
        this.boundOnMouseUp,
        false
      );
      this.isLocked = false;
    }
  }

  private onPointerlockError(event: MouseEvent): void {
    console.error("PointerLockControls: Unable to use Pointer Lock API");
  }

  private onMouseDown(event: MouseEvent): void {
    // if (this.pointerLock) {
    //   this.domElement.requestPointerLock();
    // } else {
    //   this.domElement.addEventListener(
    //     "mousemove",
    //     this.boundOnMouseMove,
    //     false
    //   );
    //   this.domElement.addEventListener("mouseup", this.boundOnMouseUp, false);
    // }
    // this.inputReceiver?.handleMouseButton(event, "mouse" + event.button, true);
  }

  private onMouseMove(event: MouseEvent): void {
    this.inputReceiver?.handleMouseMove(
      event,
      event.movementX,
      event.movementY
    );
  }

  private onMouseUp(event: MouseEvent): void {
    if (!this.pointerLock) {
      this.domElement.removeEventListener(
        "mousemove",
        this.boundOnMouseMove,
        false
      );
      this.domElement.removeEventListener(
        "mouseup",
        this.boundOnMouseUp,
        false
      );
    }

    this.inputReceiver?.handleMouseButton(event, "mouse" + event.button, false);
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.inputReceiver?.handleKeyboardEvent(event, event.code, true);
  }

  public onKeyUp(event: KeyboardEvent): void {
    this.inputReceiver?.handleKeyboardEvent(event, event.code, false);
  }

  public onMouseWheelMove(event: WheelEvent): void {
    this.inputReceiver?.handleMouseWheel(event, event.deltaY);
  }
}
