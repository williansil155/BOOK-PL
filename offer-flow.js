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

export function redirectOnExit({ checkoutSelector, offerPath, shownKey }) {
  if (!window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) return;

  let checkoutSelected = false;

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest(checkoutSelector)) {
      checkoutSelected = true;
    }
  }, { capture: true });

  window.addEventListener('pageshow', () => {
    checkoutSelected = false;
  });

  document.addEventListener('pointerout', (event) => {
    const leftAtTop = event.pointerType === 'mouse' && event.relatedTarget === null && event.clientY <= 3;
    if (!leftAtTop || checkoutSelected || document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) {
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
  });
}
