export function loadHotmartFunnel(container, preview) {
  // Hotmart supplies the purchase context in the URL when opening a funnel step.
  if (!window.location.search) return false;

  const script = document.createElement('script');
  script.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
  script.addEventListener('load', () => {
    if (!window.checkoutElements) return;

    container.hidden = false;
    window.checkoutElements.init('salesFunnel', { locale: 'de' }).mount('#hotmart-sales-funnel');
    container.querySelector('iframe')?.setAttribute('title', 'Hotmart-Angebot');
    preview.hidden = true;
  }, { once: true });
  document.head.appendChild(script);
  return true;
}
