import { getHotmartCheckout } from '/offer-flow.js';

// Substitua checkoutUrl somente pelo link Hotmart específico da oferta de 9,90 €.
// declineUrl fica reservado para o destino de recusa, sem controle visível na página.
export const recoveryOffer = {
  checkoutUrl: 'https://pay.hotmart.com/H108643314T?off=2x1w68yo&checkoutMode=10',
  declineUrl: '[LINK DE SAÍDA APÓS A RECUSA]',
};

export function getRecoveryCheckout() {
  return getHotmartCheckout(recoveryOffer.checkoutUrl);
}
