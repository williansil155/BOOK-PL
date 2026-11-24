import { getRecoveryCheckout } from './offer-config.js';

if (getRecoveryCheckout() && window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) {
  const shownKey = 'gesunde-alltagskueche:recovery-offer-shown';
  let checkoutSelected = false;

  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a.cta[href]')) {
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
      // Without tab storage, do not risk reopening the offer after Back.
      return;
    }

    window.location.assign('/angebot-990/');
  });
}
