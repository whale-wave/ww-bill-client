import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachTabbarGesture, getTabbarProgress } from '@/pages/design-system/ios-tabbar-gesture';

let detach: (() => void) | undefined;
afterEach(() => {
  detach?.();
  detach = undefined;
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function pointer(target: EventTarget, type: string, clientX: number, pointerId = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, pointerId, pointerType: 'touch', isPrimary: true });
  target.dispatchEvent(event);
}

function setup() {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(callback, 16, 0));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  const nav = document.createElement('nav');
  nav.innerHTML = Array.from({ length: 5 }, (_, index) => `<button role="tab">${index}</button>`).join('');
  document.body.append(nav);
  vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ left: 10, width: 360 } as DOMRect);
  const onPress = vi.fn();
  const onProgress = vi.fn();
  const onRelease = vi.fn();
  detach = attachTabbarGesture({ element: nav, getActiveIndex: () => 0, onPress, onProgress, onRelease });
  return { nav, button: nav.querySelector('button')!, onPress, onProgress, onRelease };
}

describe('studio iOS tabbar gesture', () => {
  it('clamps the thumb and maps the nearest tab at both edges', () => {
    expect(getTabbarProgress(-10, 0, 350, 5)).toBe(0);
    expect(getTabbarProgress(800, 0, 350, 5)).toBe(4);
    expect(getTabbarProgress(175, 0, 350, 5)).toBe(2);
    expect(getTabbarProgress(10, 0, 0, 0)).toBe(0);
  });
  it('follows the touch and releases exactly once, consuming its native click', () => {
    const { nav, button, onProgress, onRelease } = setup();
    const click = vi.fn();
    nav.addEventListener('click', click);
    pointer(button, 'pointerdown', 50);
    pointer(document, 'pointermove', 260);
    vi.advanceTimersByTime(16);
    expect(onProgress).toHaveBeenLastCalledWith(3);
    pointer(document, 'pointerup', 330);
    expect(onRelease).toHaveBeenLastCalledWith(4, false);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(click).not.toHaveBeenCalled();
    button.click();
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('ignores other pointers and cancels without selecting', () => {
    const { button, onRelease, onPress } = setup();
    pointer(button, 'pointerdown', 50);
    pointer(document, 'pointerup', 330, 2);
    expect(onRelease).not.toHaveBeenCalled();
    pointer(document, 'pointermove', 330);
    pointer(document, 'pointercancel', 330);
    expect(onRelease).toHaveBeenCalledWith(0, true);
    expect(onPress).toHaveBeenLastCalledWith(false);
    pointer(document, 'pointerup', 330);
    expect(onRelease).toHaveBeenCalledTimes(1);
  });
  it('does not activate disabled targets and detaches document listeners', () => {
    const { nav, button, onRelease } = setup();
    nav.querySelectorAll('button')[4].disabled = true;
    pointer(button, 'pointerdown', 50);
    pointer(document, 'pointerup', 330);
    expect(onRelease).toHaveBeenCalledWith(0, true);
    detach?.();
    onRelease.mockClear();
    pointer(button, 'pointerdown', 50);
    pointer(document, 'pointerup', 330);
    expect(onRelease).not.toHaveBeenCalled();
  });
  it('clears click suppression after the gesture even if no click arrives', () => {
    const { nav, button } = setup();
    const click = vi.fn();
    nav.addEventListener('click', click);
    pointer(button, 'pointerdown', 50);
    pointer(document, 'pointerup', 330);
    vi.advanceTimersByTime(501);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(click).toHaveBeenCalledTimes(1);
  });
});
