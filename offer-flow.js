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

export function redirectOnExit({
  checkoutSelector,
  offerPath,
  shownKey,
  scrollExit = false,
  backExit = false,
  oncePerTab = true,
}) {
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  const watchMouse = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
  const watchScroll = scrollExit && touchDevice;
  const watchBack = backExit && touchDevice;
  if (!watchMouse && !watchScroll && !watchBack) return;

  const backKey = `${shownKey}:back`;
  let backArmed = watchBack && history.state?.[backKey] === 'armed';
  let scrollRequested = false;
  let checkoutSelected = false;
  let offerOpened = false;

  function hasShownOffer() {
    if (offerOpened || history.state?.[shownKey]) return true;
    if (!oncePerTab) return false;
    try {
      return sessionStorage.getItem(shownKey) === '1';
    } catch {
      return false;
    }
  }

  function canOpenOffer() {
    return !checkoutSelected && document.visibilityState === 'visible'
      && !document.querySelector('dialog[open]') && !hasShownOffer();
  }

  function armBack(event) {
    if (!watchBack || backArmed || !event.isTrusted || !navigator.userActivation?.hasBeenActive || !canOpenOffer()) {
      return;
    }

    try {
      history.replaceState({ ...history.state, [backKey]: 'origin' }, '');
      history.pushState({ ...history.state, [backKey]: 'armed' }, '');
      backArmed = true;
    } catch {
      // Keep normal navigation when the browser cannot add a history entry.
    }
  }

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (link?.matches(checkoutSelector)) checkoutSelected = true;
    if (!link) armBack(event);
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    checkoutSelected = false;
  });

  function markOfferShown() {
    if (oncePerTab) {
      try {
        sessionStorage.setItem(shownKey, '1');
        return true;
      } catch {
        // Fall back to marking the current visit when browser storage is blocked.
      }
    }

    try {
      history.replaceState({ ...history.state, [shownKey]: true }, '');
      return true;
    } catch {
      return false;
    }
  }

  function openOffer(replaceEntry = false) {
    if (!canOpenOffer() || !markOfferShown()) return false;

    offerOpened = true;
    if (replaceEntry) window.location.replace(offerPath);
    else window.location.assign(offerPath);
    return true;
  }

  if (watchBack) {
    document.addEventListener('touchend', (event) => {
      if (!(event.target instanceof Element && event.target.closest('a[href]'))) armBack(event);
    }, { passive: true });

    window.addEventListener('popstate', (event) => {
      const marker = event.state?.[backKey];
      if (marker === 'armed') {
        backArmed = true;
        return;
      }
      if (!backArmed || marker !== 'origin') return;

      backArmed = false;
      const fromScroll = scrollRequested;
      scrollRequested = false;
      if (!openOffer(!fromScroll) && !fromScroll) history.back();
    });
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
    let touchY = null;
    let returningToTop = false;

    document.addEventListener('touchstart', (event) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
      returningToTop = false;
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
      if (touchY === null || event.touches.length !== 1) return;
      const y = event.touches[0].clientY;
      if (Math.abs(y - touchY) >= 12) {
        returningToTop = y > touchY;
        touchY = y;
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const y = Math.max(0, window.scrollY);
      furthestY = Math.max(furthestY, y);
      const returnedToTop = returningToTop && furthestY >= window.innerHeight / 2 && previousY > 12 && y <= 12;
      previousY = y;
      if (!returnedToTop || !canOpenOffer()) return;

      if (backArmed && !scrollRequested) {
        // Consume the extra entry before showing the scroll offer.
        scrollRequested = true;
        history.back();
      } else if (!backArmed) {
        openOffer();
      }
    }, { passive: true });
  }
}
