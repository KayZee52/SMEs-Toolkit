
import type { Settings } from './types';

export type Language = Settings['language'];

const translations = {
  en: {
    // Customer Page
    customers: 'Customers',
    addCustomer: 'Add Customer',
    totalCustomers: 'Total Customers',
    repeatBuyers30d: 'Repeat Buyers (30d)',
    debtors: 'Debtors',
    filterByName: 'Filter by customer name...',
    noResults: 'No results.',
    previous: 'Previous',
    next: 'Next',

    // Customer Columns
    name: 'Name',
    phoneNumber: 'Phone Number',
    totalSpent: 'Total Spent',
    lastPurchase: 'Last Purchase',
    debtStatus: 'Debt Status',
    hasDebt: 'Has Debt',
    noDebt: 'No Debt',
    
    // Customer Dialog
    editCustomer: 'Edit Customer',
    addNewCustomer: 'Add New Customer',
    updateCustomerDetails: 'Update the details for this customer.',
    enterNewCustomerDetails: 'Enter the details for the new customer.',
    fullName: 'Full Name',
    customerNameRequired: 'Customer name is required',
    phoneOptional: 'Phone (Optional)',
    customerType: 'Customer Type',
    selectType: 'Select type',
    regular: 'Regular',
    vip: 'VIP',
    debtor: 'Debtor',
    notesOptional: 'Notes (Optional)',
    saveChanges: 'Save changes',
  },
  'en-lr': {
    // Customer Page
    customers: 'Our Customers',
    addCustomer: 'Add New Customer',
    totalCustomers: 'All Customers',
    repeatBuyers30d: 'Good Customers (30d)',
    debtors: 'People Owning',
    filterByName: 'Find customer by name...',
    noResults: 'No customer found.',
    previous: 'Go Back',
    next: 'Go Front',
    
    // Customer Columns
    name: 'Name',
    phoneNumber: 'Phone Number',
    totalSpent: 'Total Money Spent',
    lastPurchase: 'Last Time They Buy',
    debtStatus: 'Debt Book',
    hasDebt: 'They Owe',
    noDebt: 'No Debt',
    
    // Customer Dialog
    editCustomer: 'Change Customer Info',
    addNewCustomer: 'Put New Customer Inside',
    updateCustomerDetails: 'Change the info for this customer.',
    enterNewCustomerDetails: 'Put the new customer info here.',
    fullName: 'Full Name',
    customerNameRequired: 'Customer name is a must',
    phoneOptional: 'Phone (if you get it)',
    customerType: 'Customer Type',
    selectType: 'Pick the type',
    regular: 'Regular',
    vip: 'VIP',
    debtor: 'Debtor',
    notesOptional: 'Small-small note (if you want)',
    saveChanges: 'Save ya changes',
  },
  fr: {
    // Customer Page
    customers: 'Clients',
    addCustomer: 'Ajouter un client',
    totalCustomers: 'Clients totaux',
    repeatBuyers30d: 'Acheteurs réguliers (30j)',
    debtors: 'Débiteurs',
    filterByName: 'Filtrer par nom de client...',
    noResults: 'Aucun résultat.',
    previous: 'Précédent',
    next: 'Suivant',
    
    // Customer Columns
    name: 'Nom',
    phoneNumber: 'Numéro de téléphone',
    totalSpent: 'Total dépensé',
    lastPurchase: 'Dernier achat',
    debtStatus: 'Statut de la dette',
    hasDebt: 'A une dette',
    noDebt: 'Pas de dette',
    
    // Customer Dialog
    editCustomer: 'Modifier le client',
    addNewCustomer: 'Ajouter un nouveau client',
    updateCustomerDetails: 'Mettez à jour les détails de ce client.',
    enterNewCustomerDetails: 'Saisissez les détails du nouveau client.',
    fullName: 'Nom complet',
    customerNameRequired: 'Le nom du client est requis',
    phoneOptional: 'Téléphone (Facultatif)',
    customerType: 'Type de client',
    selectType: 'Sélectionner le type',
    regular: 'Régulier',
    vip: 'VIP',
    debtor: 'Débiteur',
    notesOptional: 'Notes (Facultatif)',
    saveChanges: 'Enregistrer les modifications',
  },
};

export type Translation = typeof translations.en;

export function getTranslations(lang: Language): Translation {
  return translations[lang] || translations.en;
}
