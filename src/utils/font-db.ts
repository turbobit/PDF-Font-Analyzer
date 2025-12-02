export type LicenseStatus = 'Free' | 'Commercial' | 'Unknown';

export interface FontLicenseInfo {
    status: LicenseStatus;
    description?: string;
    url?: string;
}

const COMMON_FREE_FONTS = new Set([
    // Standard Web Fonts
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact',

    // Google Fonts (Common ones)
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
    'Slabo 27px', 'Raleway', 'PT Sans', 'Merriweather', 'Noto Sans', 'Nunito',
    'Concert One', 'Prompt', 'Work Sans', 'Inter'
]);

export function checkFontLicense(fontName: string): FontLicenseInfo {
    // Clean font name (remove subsets like "Arial-BoldMT" -> "Arial")
    const cleanName = fontName.split(/[-,]/)[0].trim();

    if (COMMON_FREE_FONTS.has(cleanName) || COMMON_FREE_FONTS.has(fontName)) {
        return {
            status: 'Free',
            description: 'Likely a standard system font or open source font.',
            url: `https://fonts.google.com/?query=${cleanName}`
        };
    }

    return {
        status: 'Unknown',
        description: 'License status could not be verified automatically.',
        url: `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font 의 PDF 임베딩 허용 여부')}&udm=50`
    };
}
