// Substitua checkoutUrl somente pelo link Hotmart específico da oferta de 9,90 €.
// declineUrl fica reservado para o destino de recusa, sem controle visível na página.
export const recoveryOffer = {
  checkoutUrl: '[LINK DO CHECKOUT HOTMART – OFERTA DE 9,90 €]',
  declineUrl: '[LINK DE SAÍDA APÓS A RECUSA]',
};

export function getRecoveryCheckout() {
  try {
    const url = new URL(recoveryOffer.checkoutUrl);
    return url.protocol === 'https:' && url.hostname === 'pay.hotmart.com' ? url : null;
  } catch {
    return null;
  }
}
