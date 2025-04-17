
/**
 * Formats a phone number string for consistent display
 * @param phoneStr The phone number string to format
 * @param defaultValue Optional default value to return if phoneStr is falsy
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneStr: string | null | undefined, defaultValue: string = "Not configured"): string => {
  if (!phoneStr) return defaultValue;
  
  // Remove any non-numeric characters
  const cleaned = phoneStr.replace(/\D/g, '');
  
  // Check if the string starts with a country code
  const hasCountryCode = cleaned.length > 10;
  
  // Format the number: +X (XXX) XXX-XXXX or (XXX) XXX-XXXX
  if (hasCountryCode) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const areaCode = cleaned.slice(cleaned.length - 10, cleaned.length - 7);
    const firstPart = cleaned.slice(cleaned.length - 7, cleaned.length - 4);
    const lastPart = cleaned.slice(cleaned.length - 4);
    return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
  } else if (cleaned.length === 10) {
    // No country code, assume US number
    const areaCode = cleaned.slice(0, 3);
    const firstPart = cleaned.slice(3, 6);
    const lastPart = cleaned.slice(6);
    return `(${areaCode}) ${firstPart}-${lastPart}`;
  }
  
  // Return the cleaned string if we can't apply a standard format
  return cleaned;
};

/**
 * Formats a phone number for use with Twilio API (e.g., for WhatsApp)
 * Ensures the number is in E.164 format (+[country code][number])
 */
export const formatPhoneE164 = (phoneStr: string | null | undefined): string | null => {
  if (!phoneStr) return null;
  
  // Remove any non-numeric characters
  const cleaned = phoneStr.replace(/\D/g, '');
  
  if (cleaned.length < 10) return null; // Invalid number
  
  // If it's 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it already has a country code
  return `+${cleaned}`;
};

/**
 * Validates a phone number 
 * @param phoneStr The phone number string to validate
 * @returns boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (phoneStr: string | null | undefined): boolean => {
  if (!phoneStr) return false;
  
  // Remove any non-numeric characters
  const cleaned = phoneStr.replace(/\D/g, '');
  
  // Check if it has at least 10 digits (US format)
  // Most international numbers will have more than 10 digits
  return cleaned.length >= 10;
};

/**
 * Extracts a country code from a phone number
 * @param phoneStr The phone number string
 * @returns The country code or null if not found
 */
export const extractCountryCode = (phoneStr: string | null | undefined): string | null => {
  if (!phoneStr) return null;
  
  // Check if the phone number starts with a plus sign and has at least one digit after
  const match = phoneStr.match(/^\+(\d+)/);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
};
