
type Listener = () => void;

export const useBlur = () => {
  const listeners: Array<Listener> = [];

  return {
    addListener: (listener: Listener) => {
      listeners.push(listener)
    },
    cleanListener: () => {
      while (listeners.length) listeners.pop();
    },
    onClick: () => listeners.forEach(l => l())
  }
}
