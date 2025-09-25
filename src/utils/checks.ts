import parsePhoneNumber, { CountryCode } from 'libphonenumber-js';

export function verifyPhoneNumber(
  number: string,
  defaultCountry: CountryCode = 'BR',
): string {
  try {
    const phoneNumber = parsePhoneNumber(number, {
      defaultCountry,
      extract: true,
    });

    if (!phoneNumber || !phoneNumber.isValid() || !phoneNumber.isPossible()) {
      throw new Error('ERR_INVALID_PHONE');
    }

    const fullPhone = phoneNumber.formatInternational({
      v2: true,
    });

    return fullPhone;
  } catch (err) {
    throw new Error('ERR_INVALID_PHONE', {
      cause: String(err),
    });
  }
}
