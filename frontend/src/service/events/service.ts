import { Signal } from "signal-ts";
import { EventState } from "./type.ts";
import { useAppSelector } from "@/service/app.ts";
import { useEffect } from "react";

class EventService {

  // Keydown
  public static readonly keyDownEvent: Signal<KeyboardEvent> = new Signal<KeyboardEvent>();

  private static onKeyDown(event: KeyboardEvent) {
    if (!this._state?.areKbdShortcutsEnabled) return;
    this.keyDownEvent.emit(event);
  }


  // Mouse
  public static readonly mouseDownEvent: Signal<MouseEvent> = new Signal<MouseEvent>();
  public static readonly mouseMoveEvent: Signal<MouseEvent> = new Signal<MouseEvent>();
  public static readonly mouseUpEvent: Signal<MouseEvent> = new Signal<MouseEvent>();
  public static readonly mouseLeaveEvent: Signal<MouseEvent> = new Signal<MouseEvent>();

  private static onMouseDown(event: MouseEvent) {
    this.mouseDownEvent.emit(event);
  }

  private static onMouseMove(event: MouseEvent) {
    this.mouseMoveEvent.emit(event);
  }

  private static onMouseUp(event: MouseEvent) {
    this.mouseUpEvent.emit(event);
  }

  private static onMouseLeave(event: MouseEvent) {
    this.mouseLeaveEvent.emit(event);
  }


  // Click
  public static readonly clickEvent: Signal<Event> = new Signal<Event>();
  public static readonly auxClickEvent: Signal<Event> = new Signal<Event>();

  private static onClick(event: Event) {
    this.clickEvent.emit(event);
  }

  private static onAuxClick(event: Event) {
    this.auxClickEvent.emit(event);
  }


  // Global

  private static _state?: EventState;
  public static set state(state: EventState) {
    this._state = state;
  }

  public static init(state: EventState) {
    this._state = state;
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
    document.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    document.addEventListener("click", this.onClick.bind(this));
    document.addEventListener("auxclick", this.onAuxClick.bind(this));
  }

  public static clear() {
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener("mousedown", this.onMouseDown.bind(this));
    document.removeEventListener("mousemove", this.onMouseMove.bind(this));
    document.removeEventListener("mouseup", this.onMouseUp.bind(this));
    document.removeEventListener("mouseleave", this.onMouseLeave.bind(this));
    document.removeEventListener("click", this.onClick.bind(this));
    document.removeEventListener("auxclick", this.onAuxClick.bind(this));
  }
}

export const useLoadEventService = () => {
  const state = useAppSelector(state => state.event);

  useEffect(() => {
    EventService.init(state)
    return () => {
      EventService.clear()
    }
  }, []);

  useEffect(() => {
    EventService.state = state;
  }, [ state ]);
}

export const useKbdEvents = () => ({
  down: EventService.keyDownEvent,
})

export const useMouseEvents = () => ({
  down: EventService.mouseDownEvent,
  up: EventService.mouseUpEvent,
  move: EventService.mouseMoveEvent,
  leave: EventService.mouseLeaveEvent,
})

export const useClickEvents = () => ({
  click: EventService.clickEvent,
  aux: EventService.auxClickEvent
})
