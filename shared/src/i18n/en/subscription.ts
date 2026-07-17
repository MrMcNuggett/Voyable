import type { TranslationStrings } from '../types';

// Copy for the advisory/AI-planning/pricing feature set (batches 2-5): the
// advisory-request modal, the global "Request advisory" nav button, the
// dashboard hero pill, the admin Inquiries tab, the Pricing screen, the
// Settings Subscription tab, and the AI-planning upgrade modal.
const subscription: TranslationStrings = {
  'advisory.navButton': 'Request advisory',
  'advisory.heroPill': 'Need help with this trip?',
  'advisory.modal.title': 'Request advisory',
  'advisory.modal.subtitle': 'A real person will help refine your route — commission-free, no bot in the loop.',
  'advisory.modal.priceLabel': '{price} {period}',
  'advisory.modal.tripLabel': 'Trip',
  'advisory.modal.tripPlaceholder': 'No trip (general request)',
  'advisory.modal.placesSaved': 'places saved so far',
  'advisory.modal.budgetLabel': 'Budget range',
  'advisory.modal.budgetPlaceholder': 'Select a range',
  'advisory.modal.budgetUnder1000': 'Under 1,000 EUR',
  'advisory.modal.budget1000to2500': '1,000 – 2,500 EUR',
  'advisory.modal.budget2500to5000': '2,500 – 5,000 EUR',
  'advisory.modal.budgetOver5000': '5,000+ EUR',
  'advisory.modal.travelStart': 'Travel start',
  'advisory.modal.travelEnd': 'Travel end',
  'advisory.modal.interestsLabel': 'Interests',
  'advisory.modal.interestsPlaceholder': 'e.g. hiking, local food, quiet towns',
  'advisory.modal.messageLabel': 'Tell us more',
  'advisory.modal.messagePlaceholder': "Tell us about the trip you're imagining...",
  'advisory.modal.emailLabel': 'Email',
  'advisory.modal.emailPlaceholder': 'your@email.com',
  'advisory.modal.cancel': 'Cancel',
  'advisory.modal.submit': 'Send request',
  'advisory.modal.submitError': 'Could not send your request. Please try again.',
  'advisory.modal.submitSuccess': 'Request sent — we will get back to you by email.',
  'advisory.email.confirmSubject': 'We received your advisory request',
  'advisory.email.confirmBody': "Thanks for reaching out. A real person will review your trip and get back to you at this address within a few days.",
  'advisory.email.adminSubject': 'New advisory request',
  'advisory.email.adminBody': 'A new advisory request was submitted. Open the admin panel to review it.',

  'admin.group.advisory': 'Advisory',
  'admin.tabs.inquiries': 'Inquiries',
  'admin.inquiries.title': 'Advisory inquiries',
  'admin.inquiries.subtitle': 'Requests submitted from trips, with a snapshot of what was being planned.',
  'admin.inquiries.filterAll': 'All',
  'admin.inquiries.statusNew': 'New',
  'admin.inquiries.statusAnswered': 'Answered',
  'admin.inquiries.statusArchived': 'Archived',
  'admin.inquiries.noTrip': 'No trip attached',
  'admin.inquiries.budget': 'Budget',
  'admin.inquiries.email': 'Email',
  'admin.inquiries.interests': 'Interests',
  'admin.inquiries.message': 'Message',
  'admin.inquiries.markAnswered': 'Mark as answered',
  'admin.inquiries.archive': 'Archive',
  'admin.inquiries.empty': 'No inquiries yet',
};

export default subscription;
