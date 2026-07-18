import type { TranslationStrings } from '../types';

// Copy for the advisory/AI-planning/pricing feature set (batches 2-5): the
// advisory-request modal, the global "Request advisory" nav button, the
// dashboard hero pill, the admin Inquiries tab, the Pricing screen, the
// Settings Subscription tab, and the AI-planning upgrade modal.
// Translated from design/voyable-i18n-de.md where a matching source string
// exists; keys marked `TODO: untranslated` below have no entry in that
// handoff doc yet and still fall back to English.
const subscription: TranslationStrings = {
  'advisory.navButton': 'Beratung anfragen',
  'advisory.heroPill': 'Hilfe bei dieser Reise gewünscht?',
  'advisory.modal.title': 'Beratung anfragen',
  'advisory.modal.subtitle': 'Ein echter Mensch hilft dir, deine Route zu verfeinern – provisionsfrei, ohne Bot dazwischen.',
  'advisory.modal.priceLabel': '{price} {period}', // TODO: untranslated
  'advisory.modal.tripLabel': 'Reise',
  'advisory.modal.tripPlaceholder': 'No trip (general request)', // TODO: untranslated
  'advisory.modal.placesSaved': 'places saved so far', // TODO: untranslated
  'advisory.modal.budgetLabel': 'Budgetrahmen',
  'advisory.modal.budgetPlaceholder': 'Bereich auswählen',
  'advisory.modal.budgetUnder1000': 'Unter 1.000 €',
  'advisory.modal.budget1000to2500': '1.000 – 2.500 €',
  'advisory.modal.budget2500to5000': '2.500 – 5.000 €',
  'advisory.modal.budgetOver5000': 'Ab 5.000 €',
  'advisory.modal.travelStart': 'Reisebeginn',
  'advisory.modal.travelEnd': 'Reiseende',
  'advisory.modal.interestsLabel': 'Interessen',
  'advisory.modal.interestsPlaceholder': 'z. B. Wandern, lokale Küche, ruhige Orte',
  'advisory.modal.messageLabel': 'Erzähl uns mehr',
  'advisory.modal.messagePlaceholder': 'Erzähl uns, wie du dir die Reise vorstellst …',
  'advisory.modal.emailLabel': 'E-Mail',
  'advisory.modal.emailPlaceholder': 'your@email.com', // TODO: untranslated
  'advisory.modal.cancel': 'Abbrechen',
  'advisory.modal.submit': 'Anfrage senden',
  'advisory.modal.submitError': 'Could not send your request. Please try again.', // TODO: untranslated
  'advisory.modal.submitSuccess': 'Request sent — we will get back to you by email.', // TODO: untranslated
  'advisory.email.confirmSubject': 'We received your advisory request', // TODO: untranslated
  'advisory.email.confirmBody': "Thanks for reaching out. A real person will review your trip and get back to you at this address within a few days.", // TODO: untranslated
  'advisory.email.adminSubject': 'New advisory request', // TODO: untranslated
  'advisory.email.adminBody': 'A new advisory request was submitted. Open the admin panel to review it.', // TODO: untranslated

  'admin.group.advisory': 'Beratung',
  'admin.tabs.inquiries': 'Anfragen',
  'admin.inquiries.title': 'Advisory inquiries', // TODO: untranslated
  'admin.inquiries.subtitle': 'Requests submitted from trips, with a snapshot of what was being planned.', // TODO: untranslated
  'admin.inquiries.filterAll': 'All', // TODO: untranslated
  'admin.inquiries.statusNew': 'Neu',
  'admin.inquiries.statusAnswered': 'Beantwortet',
  'admin.inquiries.statusArchived': 'Archiviert',
  'admin.inquiries.noTrip': 'Keine Reise verknüpft',
  'admin.inquiries.budget': 'Budget',
  'admin.inquiries.email': 'E-Mail',
  'admin.inquiries.interests': 'Interessen',
  'admin.inquiries.message': 'Nachricht',
  'admin.inquiries.markAnswered': 'Als beantwortet markieren',
  'admin.inquiries.archive': 'Archivieren',
  'admin.inquiries.empty': 'No inquiries yet', // TODO: untranslated

  'pricing.h1': 'Kostenlos planen. Hilfe holen, wenn du sie willst.',
  'pricing.subtitle': 'Der Reiseplaner hat nie eine Bezahlschranke. Das hier sind optionale Erweiterungen, falls du mehr willst.',
  'pricing.backToDashboard': 'Zurück zum Dashboard',
  'pricing.planner.tier': 'Planner', // TODO: untranslated
  'pricing.planner.price': 'Kostenlos',
  'pricing.planner.description': 'Routen, Tage, Budgets und gemeinsames Planen – ohne Haken.',
  'pricing.planner.feature1': 'Unbegrenzt viele Reisen & Orte',
  'pricing.planner.feature2': 'Tagesgenaue Routenplanung',
  'pricing.planner.feature3': 'Budget-Aufteilung & gemeinsames Planen',
  'pricing.planner.cta': 'Immer inklusive',
  'pricing.ai.tier': 'AI planning', // TODO: untranslated
  'pricing.ai.description': 'KI-generierte Routen- und Tagesvorschläge für jede Reise.',
  'pricing.ai.feature1': 'KI-Routengenerierung',
  'pricing.ai.feature2': 'Intelligente Tagesaufteilung',
  'pricing.ai.feature3': 'Unbegrenzt neu generieren',
  'pricing.ai.feature4': 'Jederzeit kündbar',
  'pricing.ai.cta': 'Abo starten',
  'pricing.advisory.tier': 'Beratung',
  'pricing.advisory.description': 'Ein echter Mensch plant oder verfeinert eine Reise mit dir.',
  'pricing.advisory.feature1': '1:1 mit einem Reiseberater',
  'pricing.advisory.feature2': 'Vollständige Reiseplan-Durchsicht',
  'pricing.advisory.feature3': 'Provisionsfreie Empfehlungen',
  'pricing.advisory.feature4': 'Lieferung innerhalb von 3 Tagen',
  'pricing.footnoteTitle': 'Außerdem gut zu wissen',
  'pricing.footnoteBody': 'Die Hotelsuche vergleicht kostenlos Preise mehrerer Buchungspartner – Voyable erhält dabei eine Provision, getrennt von der Beratung und nie an eine persönliche Empfehlung geknüpft.',
  'pricing.billingNotConfigured': 'Billing is not set up on this instance yet. Contact your administrator.', // TODO: untranslated
  'pricing.priceDisclaimer': 'Prices shown are placeholders and subject to change.', // TODO: untranslated

  'settings.tabs.subscription': 'Abo',
  'subscription.tab.subtitle': 'Der Reiseplaner selbst ist immer kostenlos. Hier geht es um optionale, kostenpflichtige Erweiterungen.',
  'subscription.tab.aiLabel': 'AI planning', // TODO: untranslated
  'subscription.tab.aiStatusNotSubscribed': 'Kein Abo',
  'subscription.tab.aiStatusActive': 'Active', // TODO: untranslated
  'subscription.tab.upgradeCta': 'Upgraden',
  'subscription.tab.advisoryLabel': 'Beratung',
  'subscription.tab.advisoryStatus': 'Zahlung pro Anfrage · keine aktive Anfrage',
  'subscription.tab.seePlansCta': 'Preise ansehen',
  'subscription.tab.billingHistoryLabel': 'Rechnungsverlauf',
  'subscription.tab.billingHistoryEmpty': 'Noch keine Rechnungen',

  'aiPlanning.sparkleTitle': 'KI-Vorschlag generieren',
  'aiPlanning.upgrade.title': 'KI-Planung ist eine kostenpflichtige Erweiterung',
  'aiPlanning.upgrade.body': 'Upgrade für KI-generierte Routenvorschläge zu dieser Reise. Der Basis-Planer bleibt in jedem Fall kostenlos.',
  'aiPlanning.upgrade.notNow': 'Nicht jetzt',
  'aiPlanning.upgrade.seePlans': 'Preise ansehen',
  'aiPlanning.results.title': 'AI suggestions', // TODO: untranslated
  'aiPlanning.results.add': 'Add', // TODO: untranslated
  'aiPlanning.results.dismiss': 'Dismiss', // TODO: untranslated
  'aiPlanning.results.error': 'Could not generate suggestions. Please try again.', // TODO: untranslated
  'aiPlanning.results.monthlyLimitReached': 'Monthly AI planning limit reached.', // TODO: untranslated

  'places.comparePrices': 'Preise vergleichen',
  'hotelSearch.title': 'Unterkünfte & Buchungen',
  'hotelSearch.subtitle': 'Preise verschiedener Buchungspartner vergleichen – die provisionsfreie Beratung ist davon getrennt.',
  'hotelSearch.whereLabel': 'Wo',
  'hotelSearch.wherePlaceholder': 'City or region', // TODO: untranslated
  'hotelSearch.datesLabel': 'Zeitraum',
  'hotelSearch.guestsLabel': 'Gäste',
  'hotelSearch.searchCta': 'Suchen',
  'hotelSearch.perNight': '/ Nacht, {nights} Nächte',
  'hotelSearch.disclaimer': 'Preise von Affiliate-Partnern, werden regelmäßig aktualisiert. Voyable erhält eine Provision für Buchungen über diese Links.',
  'hotelSearch.empty': 'Search a location to compare prices across partners.', // TODO: untranslated
  'hotelSearch.error': 'Could not load prices. Please try again.', // TODO: untranslated
  'hotelSearch.myBookings': 'My bookings', // TODO: untranslated
  'hotelSearch.searchHotels': 'Search hotels', // TODO: untranslated
};

export default subscription;
