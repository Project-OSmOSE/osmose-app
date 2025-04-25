import { useCallback, useState } from "react";

export const useModal = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  const toggle = useCallback(() => setIsOpen(prev => !prev), [setIsOpen])
  const close = useCallback(() => setIsOpen(false), [setIsOpen])
  return { isOpen, toggle, close };
}