import { redirectOnExit } from '/offer-flow.js';
import { getRecoveryCheckout } from './offer-config.js';

if (getRecoveryCheckout()) {
  redirectOnExit({
    checkoutSelector: 'a.cta[href]',
    offerPath: '/angebot-990/',
    shownKey: 'gesunde-alltagskueche:recovery-offer-shown',
    touchExit: true,
  });
}
