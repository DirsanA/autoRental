const GENERIC_E164_PHONE = /^\+[1-9]\d{1,14}$/;
const ETHIOPIAN_E164_PHONE = /^\+251[97]\d{8}$/;
const ETHIOPIAN_INTL_PHONE = /^251[97]\d{8}$/;
const ETHIOPIAN_LOCAL_PHONE = /^0[97]\d{8}$/;

function sanitizePhoneNumber(value: string): string {
  return value.replace(/[\s()-]+/g, "");
}

export function normalizePhoneNumber(value: string): string | null {
  const sanitized = sanitizePhoneNumber(value.trim());

  if (GENERIC_E164_PHONE.test(sanitized)) {
    return sanitized;
  }

  if (ETHIOPIAN_INTL_PHONE.test(sanitized)) {
    return `+${sanitized}`;
  }

  if (ETHIOPIAN_LOCAL_PHONE.test(sanitized)) {
    return `+251${sanitized.slice(1)}`;
  }

  return null;
}

export function isValidE164Phone(value: string): boolean {
  return GENERIC_E164_PHONE.test(value);
}

export function isEthiopianPhoneInput(value: string): boolean {
  const sanitized = sanitizePhoneNumber(value.trim());
  return (
    ETHIOPIAN_E164_PHONE.test(sanitized) ||
    ETHIOPIAN_INTL_PHONE.test(sanitized) ||
    ETHIOPIAN_LOCAL_PHONE.test(sanitized)
  );
}
