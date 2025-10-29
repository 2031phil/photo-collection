export const nameToCode = {
    Argentina: 'AR',
    Austria: 'AT',
    Azerbaijan: 'AZ',
    Brazil: 'BR',
    Chile: 'CL',
    Croatia: 'HR',
    'Czech Republic': 'CZ',
    England: 'GB',
    France: 'FR',
    Georgia: 'GE',
    Germany: 'DE',
    Hungary: 'HU',
    Italy: 'IT',
    Montenegro: 'ME',
    Norway: 'NO',
    'San Marino': 'SM',
    Scotland: 'SCO',
    Slovakia: 'SK',
    Slovenia: 'SI',
    Spain: 'ES',
    Sweden: 'SE',
    USA: 'US',
    Uzbekistan: 'UZ'
};

// Convenience function (optional)
export const getCountryCode = (name) => {
    if (!name) return null;

    // Normalize input: lowercase, replace underscores with spaces, capitalize each word
    const normalized = name
        .toLowerCase()
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => {
            if (word.toLowerCase() === 'usa') {
                return 'USA';
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

    return nameToCode[normalized] || null;
};