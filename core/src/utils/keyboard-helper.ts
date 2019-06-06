enum KeyboardLifecycle {
  Open = 'ionKeyboardDidOpen',
  Close = 'ionKeyboardDidClose'
}

const KEYBOARD_THRESHOLD = 150;

let previousVisualViewport: any = {};
let currentVisualViewport: any = {};

let previousLayoutViewport: any = {};
let currentLayoutViewport: any = {};

let keyboardOpen = false;

export const startKeyboardHelper = (win: Window) => {
  if (!(win as any).visualViewport) { return; }

  currentVisualViewport = copyVisualViewport((win as any).visualViewport);
  currentLayoutViewport = copyLayoutViewport(win);

  (win as any).visualViewport.addEventListener('resize', () => {
    trackViewportChanges(win);

    if (keyboardDidOpen() || keyboardDidResize(win)) {
      fireKeyboardOpenEvent(win);
      keyboardOpen = true;
    } else if (keyboardDidClose(win)) {
      fireKeyboardCloseEvent(win);
      keyboardOpen = false;
    }
  });
};

/**
 * Returns `true` if the `keyboardOpen` flag is not
 * set, the previous visual viewport width equal the current
 * visual viewport width, and if the scaled difference
 * of the previous visual viewport height minus the current
 * visual viewport height is greater than KEYBOARD_THRESHOLD
 *
 * We need to be able to accomodate users who have zooming
 * enabled in their browser (or have zoomed in manually) which
 * is why we take into account the current visual viewport's
 * scale value.
 */
const keyboardDidOpen = (): boolean => {
  const scaledHeightDifference = (previousVisualViewport.height - currentVisualViewport.height) * currentVisualViewport.scale;
  return (
    !keyboardOpen &&
    previousVisualViewport.width === currentVisualViewport.width &&
    scaledHeightDifference > KEYBOARD_THRESHOLD &&
    !layoutViewportDidChange()
  );
};

/**
 * Returns `true` if the keyboard is open,
 * but the keyboard did not close
 */
const keyboardDidResize = (win: Window): boolean => {
  return keyboardOpen && !keyboardDidClose(win);
};

/**
 * Determine if the keyboard was closed
 * Returns `true` if the `keyboardOpen` flag is set and
 * the current visual viewport height equals the
 * layout viewport height.
 */
const keyboardDidClose = (win: Window): boolean => {
  return keyboardOpen && currentVisualViewport.height === win.innerHeight;
};

/**
 * Determine if the layout viewport has
 * changed since the last visual viewport change.
 * It is rare that a layout viewport change is not
 * associated with a visual viewport change so we
 * want to make sure we don't get an false positives
 */
const layoutViewportDidChange = (): boolean => {
  return (
    currentLayoutViewport.width !== previousLayoutViewport.width ||
    currentLayoutViewport.height !== previousLayoutViewport.height
  );
};

/**
 * Dispatch a keyboard open event
 */
const fireKeyboardOpenEvent = (win: Window): void => {
  const ev = new CustomEvent(KeyboardLifecycle.Open, {
    detail: { keyboardHeight: win.innerHeight - currentVisualViewport.height }
  });

  win.dispatchEvent(ev);
};

/**
 * Dispatch a keyboard close event
 */
const fireKeyboardCloseEvent = (win: Window): void => {
  const ev = new CustomEvent(KeyboardLifecycle.Close);
  win.dispatchEvent(ev);
};

/**
 * Given a window object, create a copy of
 * the current visual and layout viewport states
 * while also preserving the previous visual and
 * layout viewport states
 */
const trackViewportChanges = (win: Window) => {
  previousVisualViewport = { ...currentVisualViewport };
  currentVisualViewport = copyVisualViewport((win as any).visualViewport);

  previousLayoutViewport = { ...currentLayoutViewport };
  currentLayoutViewport = copyLayoutViewport(win);
};

/**
 * Creates a deep copy of the visual viewport
 * at a given state
 */
const copyVisualViewport = (visualViewport: any): any => {
  return {
    width: Math.round(visualViewport.width),
    height: Math.round(visualViewport.height),
    offsetTop: visualViewport.offsetTop,
    offsetLeft: visualViewport.offsetLeft,
    pageTop: visualViewport.pageTop,
    pageLeft: visualViewport.pageLeft,
    scale: visualViewport.scale
  };
};

/**
 * Creates a deep copy of the layout viewport
 * at a given state
 */
const copyLayoutViewport = (win: Window): any => {
  return {
    width: win.innerWidth,
    height: win.innerHeight
  };
};
