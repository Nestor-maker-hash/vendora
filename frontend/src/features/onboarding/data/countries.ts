export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿" },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳" },
  { name: "Côte d'Ivoire", code: "CI", dialCode: "+225", flag: "🇨🇮" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];
