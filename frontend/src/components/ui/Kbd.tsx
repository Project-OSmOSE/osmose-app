import React, { useMemo } from "react";
import styles from './ui.module.scss'

type Key =
  | "command"
  | "shift"
  | "ctrl"
  | "option"
  | "enter"
  | "delete"
  | "escape"
  | "tab"
  | "capslock"
  | "up"
  | "right"
  | "down"
  | "left"
  | "pageup"
  | "pagedown"
  | "home"
  | "end"
  | "help"
  | "space"
  | number;
const KEY_MAP: Record<Key, string> = {
  command: "⌘",
  shift: "⇧",
  ctrl: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌫",
  escape: "⎋",
  tab: "⇥",
  capslock: "⇪",
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
  help: "?",
  space: "␣",
};

export const Kbd: React.FC<{ keys: Key | Array<Key> }> = ({ keys }) => {

  const content: string[] = useMemo(() => {
    let data: Array<Key> = [];
    switch (typeof keys) {
      case "string":
      case "number":
        data = [ keys ]
        break;
      default:
        data = keys
    }
    return data.map(k => {
      if (typeof k === 'number') return k.toString();
      if (Object.keys(KEY_MAP).includes(k)) return KEY_MAP[k];
      return k;
    })
  }, [ keys ])

  return (
    <kbd className={ styles.kbd }>{ content.map(k => <kbd>{ k }</kbd>) }</kbd>
  )
}