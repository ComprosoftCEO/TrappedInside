/**
 * Represents a key that can be pressed on the keyboard.
 *
 * Letter keys are handled as lowercase input, even if the "Shift" key is pressed.
 */
export enum Key {
  Up,
  Down,
  Left,
  Right,

  Control,
  Alt,
  Delete,
  Backspace,
  CapsLock,
  Enter,
  Escape,
  End,
  Shift,
  PageUp,
  PageDown,
  Pause,
  Cancel,
  ScrollLock,

  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,

  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,

  Num1,
  Num2,
  Num3,
  Num4,
  Num5,
  Num6,
  Num7,
  Num8,
  Num9,
  Num0,

  Amperstand,
  Asterisk,
  At,
  BackSlash,
  BraceLeft,
  BraceRight,
  Caret,
  CloseBracket,
  Colon,
  Comma,
  Dollar,
  EqualSign,
  ExclamationPoint,
  GreaterThan,
  LeftParen,
  LessThan,
  Minus,
  Hashtag,
  OpenBracket,
  Period,
  QuestionMark,
  SingleQuote,
  DoubleQuote,
  RightParen,
  Semicolon,
  ForwardSlash,
  Underscore,
  Space,
  Tick,
  Tilda,
}

/**
 * Represents buttons on a gamepad.
 * Not all gamepads support all buttons.
 */
export enum GamepadButton {
  Up = 12,
  Down = 13,
  Left = 14,
  Right = 15,
  ACross = 0,
  BCircle = 1,
  XSquare = 2,
  YTriangle = 3,
  Select = 8, // [X]     [ ]
  Start = 9, //  [ ]     [X]
  Center = 16,
  LeftBumper = 4, // LB, Top button
  RightBumper = 5, // RB, Top button
  LeftStickCenter = 10,
  RightStickCenter = 11,
}

/**
 * Represent axes on the gamepad sticks.
 * Not all gamepads support all axes.
 */
export enum GamepadAxis {
  LeftStickX = 0, // Negative = Left, Positive = Right
  LeftStickY = 1, // Negative = Up, Positive = Down
  RightStickX = 2, // Negative = Left, Positive = Right
  RightStickY = 3, // Negative = Up, Positive = Down
  LeftTrigger = 4, // LT, Bottom button
  RightTrigger = 5, // RT, Bottom button
}

/**
 * All mouse buttons
 */
export enum MouseButton {
  Left,
  Middle,
  Right,
}

/**
 * Map the JavaScript string of event.key to a Key enum
 */
const KEY_MAP: Record<string, Key> = {
  ['ArrowUp']: Key.Up,
  ['ArrowDown']: Key.Down,
  ['ArrowLeft']: Key.Left,
  ['ArrowRight']: Key.Right,

  ['Control']: Key.Control,
  ['Alt']: Key.Alt,
  ['Delete']: Key.Delete,
  ['Backspace']: Key.Backspace,
  ['CapsLock']: Key.CapsLock,
  ['Enter']: Key.Enter,
  ['Escape']: Key.Escape,
  ['End']: Key.End,
  ['Shift']: Key.Shift,
  ['PageUp']: Key.PageUp,
  ['PageDown']: Key.PageDown,
  ['Pause']: Key.Pause,
  ['Cancel']: Key.Cancel,
  ['ScrollLock']: Key.ScrollLock,

  ['a']: Key.A,
  ['b']: Key.B,
  ['c']: Key.C,
  ['d']: Key.D,
  ['e']: Key.E,
  ['f']: Key.F,
  ['g']: Key.G,
  ['h']: Key.H,
  ['i']: Key.I,
  ['j']: Key.J,
  ['k']: Key.K,
  ['l']: Key.L,
  ['m']: Key.M,
  ['n']: Key.N,
  ['o']: Key.O,
  ['p']: Key.P,
  ['q']: Key.Q,
  ['r']: Key.R,
  ['s']: Key.S,
  ['t']: Key.T,
  ['u']: Key.U,
  ['v']: Key.V,
  ['w']: Key.W,
  ['x']: Key.X,
  ['y']: Key.Y,
  ['z']: Key.Z,

  ['A']: Key.A,
  ['B']: Key.B,
  ['C']: Key.C,
  ['D']: Key.D,
  ['E']: Key.E,
  ['F']: Key.F,
  ['G']: Key.G,
  ['H']: Key.H,
  ['I']: Key.I,
  ['J']: Key.J,
  ['K']: Key.K,
  ['L']: Key.L,
  ['M']: Key.M,
  ['N']: Key.N,
  ['O']: Key.O,
  ['P']: Key.P,
  ['Q']: Key.Q,
  ['R']: Key.R,
  ['S']: Key.S,
  ['T']: Key.T,
  ['U']: Key.U,
  ['V']: Key.V,
  ['W']: Key.W,
  ['X']: Key.X,
  ['Y']: Key.Y,
  ['Z']: Key.Z,

  ['F1']: Key.F1,
  ['F2']: Key.F2,
  ['F3']: Key.F3,
  ['F4']: Key.F4,
  ['F5']: Key.F5,
  ['F6']: Key.F6,
  ['F7']: Key.F7,
  ['F8']: Key.F8,
  ['F9']: Key.F9,
  ['F10']: Key.F10,
  ['F11']: Key.F11,
  ['F12']: Key.F12,

  ['1']: Key.Num1,
  ['2']: Key.Num2,
  ['3']: Key.Num3,
  ['4']: Key.Num4,
  ['5']: Key.Num5,
  ['6']: Key.Num6,
  ['7']: Key.Num7,
  ['8']: Key.Num8,
  ['9']: Key.Num9,
  ['0']: Key.Num0,

  ['&']: Key.Amperstand,
  ['*']: Key.Asterisk,
  ['@']: Key.At,
  ['\\']: Key.BackSlash,
  ['{']: Key.BraceLeft,
  ['}']: Key.BraceRight,
  ['^']: Key.Caret,
  [']']: Key.CloseBracket,
  [':']: Key.Colon,
  [',']: Key.Comma,
  ['$']: Key.Dollar,
  ['=']: Key.EqualSign,
  ['!']: Key.ExclamationPoint,
  ['>']: Key.GreaterThan,
  ['(']: Key.LeftParen,
  ['<']: Key.LessThan,
  ['-']: Key.Minus,
  ['#']: Key.Hashtag,
  ['[']: Key.OpenBracket,
  ['.']: Key.Period,
  ['?']: Key.QuestionMark,
  // eslint-disable-next-line quotes
  ["'"]: Key.SingleQuote,
  ['"']: Key.DoubleQuote,
  [')']: Key.RightParen,
  [';']: Key.Semicolon,
  ['/']: Key.ForwardSlash,
  ['_']: Key.Underscore,
  [' ']: Key.Space,
  ['`']: Key.Tick,
  ['~']: Key.Tilda,
};

/**
 * Map the JavaScript event.button to a mouse button
 */
const MOUSE_MAP: Record<number, MouseButton> = {
  [0]: MouseButton.Left,
  [1]: MouseButton.Middle,
  [2]: MouseButton.Right,
};

// Other internal constants
const LEFT_TRIGGER_BUTTON = 6;
const RIGHT_TRIGGER_BUTTON = 7;

// Store data about a single gamepad
class GamepadState {
  public buttonsStart: Set<GamepadButton>;
  public buttonsDown: Set<GamepadButton>;
  public buttonsReleased: Set<GamepadButton>;
  public axes: number[];

  public static fromGamepad(gamepad: Gamepad): GamepadState {
    return {
      buttonsStart: new Set(),
      buttonsDown: new Set(),
      buttonsReleased: new Set(),
      axes: [...gamepad.axes, gamepad.buttons[LEFT_TRIGGER_BUTTON].value, gamepad.buttons[RIGHT_TRIGGER_BUTTON].value],
    };
  }
}

/**
 * Handles all user-input from the game
 */
export class InputManager {
  private readonly canvas: HTMLCanvasElement;

  private keysStart: Set<Key> = new Set();
  private keysDown: Set<Key> = new Set();
  private keysReleased: Set<Key> = new Set();

  private gamepadState: Record<number, GamepadState> = {};

  private mouseCoords: [number, number] = [0, 0];
  private mouseMovement: [number, number] = [0, 0]; // Used with Pointer Lock
  private mouseStart: Set<MouseButton> = new Set();
  private mouseDown: Set<MouseButton> = new Set();
  private mouseReleased: Set<MouseButton> = new Set();
  private _pointerLockEnabled = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Keyboard
    canvas.addEventListener('keydown', this.onKeyDown.bind(this));
    canvas.addEventListener('keyup', this.onKeyRelease.bind(this));

    // Gamepad
    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));

    // Mouse
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('click', this.onPointerLockClick.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('pointerlockerror', this.onPointerLockError.bind(this));
  }

  /**
   * Called whenever a key is pressed on the keyboard.
   * Fired multiple times if a key is continually pressed in.
   */
  private onKeyDown(event: KeyboardEvent) {
    const key = KEY_MAP[event.key];
    if (typeof key !== 'undefined') {
      this.keysDown.add(key);

      if (!event.repeat) {
        this.keysStart.add(key);
      }
    }
  }

  /**
   * Called when a key is released from being pressed
   */
  private onKeyRelease(event: KeyboardEvent) {
    const key = KEY_MAP[event.key];
    if (typeof key !== 'undefined') {
      this.keysDown.delete(key);
      this.keysReleased.add(key);
    }
  }

  /**
   * Called internally by the game engine to clear all keys started and keys released.
   */
  _clearKeyTick(): void {
    this.keysStart.clear();
    this.keysReleased.clear();
  }

  /**
   * Test if a key has just been pressed down.
   * Only returns true during this tick, and then the event is cleared.
   */
  public isKeyStarted(key: Key): boolean {
    return this.keysStart.has(key);
  }

  /**
   * Test if a key is currently pressed down.
   * Will continue to return true as long as the key is being pressed down.
   */
  public isKeyDown(key: Key): boolean {
    return this.keysDown.has(key);
  }

  /**
   * Test if a key has just been released.
   * Only returns true during this tick, and then the event is cleared.
   */
  public isKeyReleased(key: Key): boolean {
    return this.keysReleased.has(key);
  }

  /**
   * Called when a gamepad is connected to the browser
   */
  private onGamepadConnected(event: GamepadEvent) {
    const gamepad = event.gamepad;
    if (gamepad.mapping !== 'standard') {
      return; /* Unsupported gamepad */
    }

    this.gamepadState[gamepad.index] = GamepadState.fromGamepad(gamepad);
  }

  /**
   * Called by the browser when a gamepad is disconnected from the system
   */
  private onGamepadDisconnected(event: GamepadEvent) {
    const gamepad = event.gamepad;
    delete this.gamepadState[gamepad.index];
  }

  /**
   * Called internally by the game engine to update gamepads
   */
  _updateGamepad(): void {
    // Make sure we support gamepads
    if (typeof navigator.getGamepads === 'undefined') {
      return;
    }

    // Update the individual gamepads by querrying the new state
    for (const gamepad of navigator.getGamepads()) {
      if (gamepad === null) {
        continue;
      }

      const gamepadState = this.gamepadState[gamepad.index] || GamepadState.fromGamepad(gamepad);
      const buttonsStart: Set<GamepadButton> = new Set();
      const buttonsDown: Set<GamepadButton> = new Set();
      const buttonsReleased: Set<GamepadButton> = new Set();

      // Loop over every button supported
      for (const buttonKey in GamepadButton) {
        if (isNaN(Number(buttonKey))) {
          continue; /* Skip enum string values */
        }

        const button: GamepadButton = Number(buttonKey) as GamepadButton;
        if (gamepad.buttons[button].pressed) {
          buttonsDown.add(button);

          if (!gamepadState.buttonsDown.has(button)) {
            buttonsStart.add(button);
          }
        } else {
          if (gamepadState.buttonsDown.has(button)) {
            buttonsReleased.add(button);
          }
        }
      }

      // Also get the axes for the left and right triggers
      const axes = [
        ...gamepad.axes,
        gamepad.buttons[LEFT_TRIGGER_BUTTON].value,
        gamepad.buttons[RIGHT_TRIGGER_BUTTON].value,
      ];

      // Replace the existing state with the new state
      Object.assign(this.gamepadState[gamepad.index], { buttonsStart, buttonsDown, buttonsReleased, axes });
    }
  }

  /**
   * Test if a button has just been pressed down on a gamepad.
   * Only returns true during this tick, and then the event is cleared.
   */
  public isGamepadButtonStarted(gamepad: number, button: GamepadButton): boolean {
    const gamepadState = this.gamepadState[gamepad];
    if (typeof gamepadState === 'undefined') {
      return false;
    }

    return gamepadState.buttonsStart.has(button);
  }

  /**
   * Test if a button is currently pressed down on a gamepad.
   * Will continue to return true as long as the button is being pressed down.
   */
  public isGamepadButtonDown(gamepad: number, button: GamepadButton): boolean {
    const gamepadState = this.gamepadState[gamepad];
    if (typeof gamepadState === 'undefined') {
      return false;
    }

    return gamepadState.buttonsDown.has(button);
  }

  /**
   * Test if a button has just been released on a gamepad.
   * Only returns true during this tick, and then the event is cleared.
   */
  public isGamepadButtonReleased(gamepad: number, button: GamepadButton): boolean {
    const gamepadState = this.gamepadState[gamepad];
    if (typeof gamepadState === 'undefined') {
      return false;
    }

    return gamepadState.buttonsReleased.has(button);
  }

  /**
   * Get the value of an axis on the gamepad.
   *
   * The range of values for a joystickwill be between -1.0 and 1.0.
   * The range of values for the LT and RT is between 0.0 and 1.0.
   */
  public getGamepadAxis(gamepad: number, axis: GamepadAxis): number {
    const gamepadState = this.gamepadState[gamepad];
    if (typeof gamepadState === 'undefined') {
      return 0;
    }

    return gamepadState.axes[axis];
  }

  /**
   * Get the current status of the pointer lock
   */
  public get pointerLockEnabled(): boolean {
    return this._pointerLockEnabled;
  }

  /**
   * Enable or disable pointer lock, which fixes the mouse to the center of the Canvas.
   */
  public set pointerLockEnabled(enabled: boolean) {
    this._pointerLockEnabled = enabled;
    if (!enabled) {
      document.exitPointerLock();
    }
  }

  /**
   * Called when the mouse moves across the Canvas element
   */
  private onMouseMove(event: MouseEvent) {
    this.mouseCoords = [event.clientX, event.clientY];
    if (document.pointerLockElement === this.canvas) {
      this.mouseMovement = [event.movementX, event.movementY];
    } else {
      this.mouseMovement = [0, 0];
    }
  }

  /**
   * Called when a mouse button is pressed
   */
  private onMouseDown(event: MouseEvent) {
    const button = MOUSE_MAP[event.button];
    if (typeof button !== 'undefined') {
      this.mouseDown.add(button);
      this.mouseStart.add(button);
    }
  }

  /**
   * Called when a mouse button is released
   */
  private onMouseUp(event: MouseEvent) {
    const button = MOUSE_MAP[event.button];
    if (typeof button !== 'undefined') {
      this.mouseDown.delete(button);
      this.mouseReleased.delete(button);
    }
  }

  /**
   * Called whenever the Canvas element is clicked to enable the pointer lock.
   * Probably not necessary, but just in case.
   */
  private onPointerLockClick() {
    if (this._pointerLockEnabled) {
      this.canvas.requestPointerLock();
    }
  }

  /**
   * Called whenever the pointer lock is changed
   */
  private onPointerLockChange(_event: Event) {
    if (document.pointerLockElement !== this.canvas) {
      this.mouseMovement = [0, 0];
    }
  }

  /**
   * Called on a pointer lock error
   * Sometimes, the user might need to click multiple times before pointer lock is re-engaged
   */
  private onPointerLockError(_error: Event) {}

  /**
   * Called internally by the game engine to clear all keys started and keys released.
   */
  _clearMouseTick(): void {
    this.mouseStart.clear();
    this.mouseReleased.clear();
    this.mouseMovement = [0, 0];
  }

  /**
   * Test if a mouse button has just been pressed
   * Only returns true during this tick, and then the event is cleared.
   */
  public isMouseButtonStarted(button: MouseButton): boolean {
    return this.mouseStart.has(button);
  }

  /**
   * Test if a mouse button is currently pressed down.
   * Will continue to return true as long as the button is being pressed down.
   */
  public isMouseButtonDown(button: MouseButton): boolean {
    return this.mouseDown.has(button);
  }

  /**
   * Test if a mouse button has just been released.
   * Only returns true during this tick, and then the event is cleared.
   */
  public isMouseButtonReleased(button: MouseButton): boolean {
    return this.mouseReleased.has(button);
  }

  /**
   * Get the X position of the mouse relative to the location inside the canvas.
   *
   * Coordinates are calculated from the top-left corner of the Canvas
   */
  public getMouseX(): number {
    return this.mouseCoords[0];
  }

  /**
   * Get the Y position of the mouse relative to the location inside the canvas
   *
   * Coordinates are calculated from the top-left corner of the Canvas
   */
  public getMouseY(): number {
    return this.mouseCoords[1];
  }

  /**
   * Get the X movement of the mouse since the last movement event
   *
   * Coordinates are calculated from the top-left corner of the Canvas
   *
   * Returns 0 if pointer lock is not enabled
   */
  public getMouseMovementX(): number {
    return this.mouseMovement[0];
  }

  /**
   * Get the Y movement of the mouse since the last movement event
   *
   * Coordinates are calculated from the top-left corner of the Canvas
   *
   * Returns 0 if pointer lock is not enabled
   */
  public getMouseMovementY(): number {
    return this.mouseMovement[1];
  }
}
