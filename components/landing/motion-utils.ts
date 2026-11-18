import gsap from "gsap";

/** Not yet scrolled into view. Only these get a hidden start state. */
export const belowFold = (node: Element) =>
  node.getBoundingClientRect().top >= window.innerHeight - 1;

/**
 * Magnetic buttons: the button leans a little towards the pointer while it is
 * hovered and springs back when the pointer leaves. Returns a cleanup function.
 */
export function attachMagnetic(buttons: HTMLElement[], strength = 0.28) {
  const cleanups = buttons.map((button) => {
    const x = gsap.quickTo(button, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(button, "y", { duration: 0.5, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      const box = button.getBoundingClientRect();
      x((event.clientX - (box.left + box.width / 2)) * strength);
      y((event.clientY - (box.top + box.height / 2)) * strength);
    };
    const onLeave = () => {
      x(0);
      y(0);
    };

    button.addEventListener("pointermove", onMove);
    button.addEventListener("pointerleave", onLeave);
    return () => {
      button.removeEventListener("pointermove", onMove);
      button.removeEventListener("pointerleave", onLeave);
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

/**
 * Tilt: `target` leans in 3D towards the pointer while it is over `area`.
 * `area` needs a CSS perspective. Returns a cleanup function.
 */
export function attachTilt(
  area: HTMLElement,
  target: HTMLElement,
  degrees = 6,
) {
  const rotateX = gsap.quickTo(target, "rotationX", {
    duration: 0.7,
    ease: "power3",
  });
  const rotateY = gsap.quickTo(target, "rotationY", {
    duration: 0.7,
    ease: "power3",
  });

  const onMove = (event: PointerEvent) => {
    const box = area.getBoundingClientRect();
    rotateY(((event.clientX - box.left) / box.width - 0.5) * degrees);
    rotateX(-((event.clientY - box.top) / box.height - 0.5) * degrees);
  };
  const onLeave = () => {
    rotateX(0);
    rotateY(0);
  };

  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);
  return () => {
    area.removeEventListener("pointermove", onMove);
    area.removeEventListener("pointerleave", onLeave);
  };
}
