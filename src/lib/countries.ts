const ISO_COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`;

export const RESIDENCE_COUNTRIES = ISO_COUNTRY_CODES.split(' ');

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const PHONE_FLAG_SPRITE_MISSING = new Set(['AQ', 'AX', 'BV', 'CC', 'CX', 'EH', 'GG', 'GS', 'HM', 'IM', 'PN', 'SJ', 'TF', 'UM', 'YT']);
const TWITTER_FLAG_IMAGE_BASE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64';

function countryFlagImageUrl(code: string) {
  const unified = [...code.toUpperCase()]
    .map(letter => (0x1f1e6 + letter.charCodeAt(0) - 65).toString(16))
    .join('-');
  return `${TWITTER_FLAG_IMAGE_BASE}/${unified}.png`;
}

export const COUNTRY_OPTIONS = RESIDENCE_COUNTRIES
  .map(value => ({
    value,
    label: countryNames.of(value) || value,
    flagCode: value.toLowerCase(),
    ...(PHONE_FLAG_SPRITE_MISSING.has(value) ? { flagImageUrl: countryFlagImageUrl(value) } : {}),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
