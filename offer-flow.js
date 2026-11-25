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

export function redirectOnExit({ checkoutSelector, offerPath, shownKey, scrollExit = false }) {
  const watchMouse = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
  const watchScroll = scrollExit && window.matchMedia('(pointer: coarse)').matches;
  if (!watchMouse && !watchScroll) return;

  let checkoutSelected = false;
  let offerOpened = false;

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest(checkoutSelector)) {
      checkoutSelected = true;
    }
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    checkoutSelected = false;
  });

  function openOffer() {
    if (offerOpened || checkoutSelected || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) {
      return;
    }

    try {
      if (sessionStorage.getItem(shownKey)) return;
      sessionStorage.setItem(shownKey, '1');
    } catch {
      // Use the existing history entry when browser storage is blocked.
      if (history.state?.[shownKey]) return;
      try {
        history.replaceState({ ...history.state, [shownKey]: true }, '');
      } catch {
        return;
      }
    }

    offerOpened = true;
    window.location.assign(offerPath);
  }

  if (watchMouse) {
    document.addEventListener('pointerout', (event) => {
      if (event.pointerType === 'mouse' && event.relatedTarget === null && event.clientY <= 3) {
        openOffer();
      }
    });
  }

  if (watchScroll) {
    let previousY = Math.max(0, window.scrollY);
    let furthestY = previousY;

    window.addEventListener('scroll', () => {
      const y = Math.max(0, window.scrollY);
      furthestY = Math.max(furthestY, y);
      const returnedToTop = furthestY >= window.innerHeight / 2 && previousY > 12 && y <= 12;
      previousY = y;
      if (returnedToTop) openOffer();
    }, { passive: true });
  }
}
