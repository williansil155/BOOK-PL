export function getHotmartCheckout(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'pay.hotmart.com' ? url : null;
  } catch {
    return null;
  }
}

export function enableHotmartCheckout(link, checkout) {
  if (!checkout) return;

  link.href = checkout.href;
  link.removeAttribute('role');
  link.removeAttribute('aria-disabled');
}

export function redirectOnExit({ checkoutSelector, offerPath, shownKey, touchExit = false }) {
  const watchMouse = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
  const watchTouch = touchExit && window.matchMedia('(pointer: coarse)').matches;
  if (!watchMouse && !watchTouch) return;

  let checkoutSelected = false;

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest(checkoutSelector)) {
      checkoutSelected = true;
    }
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    checkoutSelected = false;
  });

  function openOffer() {
    if (checkoutSelected || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) {
      return;
    }

    try {
      if (sessionStorage.getItem(shownKey)) return;
      sessionStorage.setItem(shownKey, '1');
    } catch {
      // Tab storage prevents reopening the offer when the visitor goes back.
      return;
    }

    window.location.assign(offerPath);
  }

  if (watchMouse) {
    document.addEventListener('pointerout', (event) => {
      if (event.pointerType === 'mouse' && event.relatedTarget === null && event.clientY <= 3) {
        openOffer();
      }
    });
  }

  if (watchTouch) {
    let readPastTop = false;
    let gestureStart = null;

    window.addEventListener('scroll', () => {
      if (window.scrollY >= window.innerHeight / 2) readPastTop = true;
    }, { passive: true });

    document.addEventListener('touchstart', (event) => {
      gestureStart = readPastTop && window.scrollY <= 12 && event.touches.length === 1
        ? event.touches[0]
        : null;
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
      if (!gestureStart || event.touches.length !== 1 || window.scrollY > 12) return;

      const touch = event.touches[0];
      const down = touch.clientY - gestureStart.clientY;
      const across = Math.abs(touch.clientX - gestureStart.clientX);
      if (down >= 90 && down > across * 2) {
        gestureStart = null;
        openOffer();
      }
    }, { passive: true });
  }
}
