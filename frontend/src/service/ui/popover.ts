import { useMemo, useRef } from "react";

export const usePopover = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const top: number = useMemo(() => {
    if (!containerRef.current) return 0;
    const bounds = containerRef.current.getBoundingClientRect()
    const html = document.getElementsByTagName('html')[0]
    return html.scrollTop + bounds.top + bounds.height;
  }, [ containerRef.current?.getBoundingClientRect() ]);

  const right: number = useMemo(() => {
    if (!containerRef.current) return 0;
    const bounds = containerRef.current.getBoundingClientRect()
    const html = document.getElementsByTagName('html')[0]
    return html.offsetWidth - (bounds.left + bounds.width);
  }, [ containerRef.current?.getBoundingClientRect() ]);

  const left: number = useMemo(() => {
    if (!containerRef.current) return 0;
    return containerRef.current.getBoundingClientRect().left;
  }, [ containerRef.current?.getBoundingClientRect() ]);

  const width: number = useMemo(() => {
    if (!containerRef.current) return 0;
    return containerRef.current.getBoundingClientRect().width;
  }, [ containerRef.current?.getBoundingClientRect() ]);

  return { containerRef, top, left, right, width }
}