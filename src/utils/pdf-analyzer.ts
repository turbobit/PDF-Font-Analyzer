import * as pdfjsLib from 'pdfjs-dist';

// Initialize worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export interface FontData {
    name: string;
    type: string;
    embedded: boolean;
}

export interface AnalysisResult {
    fonts: FontData[];
    logs: string[];
}

export async function analyzePdfFonts(file: File): Promise<AnalysisResult> {
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(`[PDF-Analyzer] ${msg}`);
        logs.push(msg);
    };

    log(`Starting analysis for file: ${file.name} (${file.size} bytes)`);

    try {
        const arrayBuffer = await file.arrayBuffer();

        // Configure getDocument with options to avoid storage/CORS issues
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
            disableAutoFetch: true,
            disableStream: true,
        });

        const doc = await loadingTask.promise;
        log(`Document loaded. Pages: ${doc.numPages}`);

        const fonts = new Map<string, FontData>();

        for (let i = 1; i <= doc.numPages; i++) {
            log(`Processing page ${i}...`);
            const page = await doc.getPage(i);

            // Ensure resources are loaded and get operator list
            let ops: any = null;
            try {
                ops = await page.getOperatorList();
                log(`Page ${i} operator list loaded. Ops count: ${ops.fnArray.length}`);
            } catch (opError: any) {
                log(`Warning: Failed to get operator list for page ${i}: ${opError.message}`);
            }

            const checkFont = (obj: any, source: string) => {
                if (!obj) return;

                let fontName = null;
                let fontType = 'Unknown';
                let isEmbedded = false;

                // Check various properties where font info might be hidden
                if (obj.data && obj.data.name) {
                    fontName = obj.data.name;
                    fontType = obj.data.type || 'Unknown';
                    isEmbedded = !!obj.data.file;
                } else if (obj.name) {
                    fontName = obj.name;
                    fontType = obj.type || 'Unknown';
                    isEmbedded = !!obj.file;
                } else if (obj.fontName) {
                    fontName = obj.fontName;
                }

                if (fontName) {
                    // Step 1: Remove subset prefix like "ABCDEF+Arial"
                    let cleanName = fontName.includes('+') ? fontName.split('+')[1] : fontName;
                    const originalCleanName = cleanName;

                    // Step 2: Smart suffix removal - only remove if it looks like a hex suffix pattern
                    // Pattern: lowercase font name ending with 1-3 hex characters (common in Korean fonts)
                    // Examples: nanumgtm51, nanumgtbc7, nanumgtbb1
                    // But NOT: MalgunGothic, KoPubWorldDotumBold (these end with normal letters)

                    // Check if the name ends with 1-3 hex digits AND the base name is lowercase
                    const hexSuffixMatch = cleanName.match(/^([a-z]+)([0-9a-f]{1,3})$/i);

                    if (hexSuffixMatch) {
                        // Only remove suffix if the base part is all lowercase (like nanumgtm, nanumgtb)
                        const basePart = hexSuffixMatch[1];
                        const suffixPart = hexSuffixMatch[2];

                        // Check if base is lowercase and suffix is hex-like
                        if (basePart === basePart.toLowerCase() && /^[0-9a-f]+$/i.test(suffixPart)) {
                            cleanName = basePart;
                            log(`Removed hex suffix: ${originalCleanName} -> ${cleanName}`);
                        }
                    }

                    // Use clean name as key to prevent duplicates
                    if (!fonts.has(cleanName)) {
                        log(`Found font: ${fontName} (Clean: ${cleanName}, Type: ${fontType}) in ${source}`);
                        fonts.set(cleanName, {
                            name: cleanName,
                            type: fontType,
                            embedded: isEmbedded
                        });
                    }
                }
            };

            const commonObjs = page.commonObjs;

            // Strategy 1: Scan Operator List for setFont commands
            if (ops && ops.fnArray) {
                const setFontOp = pdfjsLib.OPS.setFont;
                for (let j = 0; j < ops.fnArray.length; j++) {
                    if (ops.fnArray[j] === setFontOp) {
                        const fontName = ops.argsArray[j][0];
                        // fontName is usually an internal ID like 'g_d0_f1'

                        // Try to resolve this ID in commonObjs
                        let fontObj = null;
                        // @ts-ignore
                        if (commonObjs.get) {
                            // @ts-ignore
                            fontObj = commonObjs.get(fontName);
                        } else {
                            // @ts-ignore
                            fontObj = commonObjs._objs ? commonObjs._objs[fontName] : null;
                        }

                        if (fontObj) {
                            checkFont(fontObj, `OperatorList(setFont) -> ${fontName}`);
                        } else {
                            log(`Found setFont operator for ${fontName} but could not resolve object.`);
                        }
                    }
                }
            }

            // Strategy 2: Iterate commonObjs (Existing robust logic)
            // @ts-ignore
            if (commonObjs) {
                // @ts-ignore
                if (commonObjs.forEach) {
                    // @ts-ignore
                    commonObjs.forEach((obj) => checkFont(obj, 'commonObjs.forEach'));
                } else if (commonObjs._objs) {
                    // @ts-ignore
                    log(`Using fallback commonObjs._objs. Keys: ${Object.keys(commonObjs._objs).length}`);
                    // @ts-ignore
                    for (const key in commonObjs._objs) {
                        // @ts-ignore
                        checkFont(commonObjs._objs[key], 'commonObjs._objs');
                    }
                } else {
                    log(`commonObjs exists but no iteration method found.`);
                }
            } else {
                log(`Page ${i} has no commonObjs`);
            }

            // Strategy 3: Check page.objs
            // @ts-ignore
            const pageObjs = page.objs;
            if (pageObjs) {
                // @ts-ignore
                if (pageObjs.forEach) {
                    // @ts-ignore
                    pageObjs.forEach((obj) => checkFont(obj, 'page.objs.forEach'));
                } else if (pageObjs._objs) {
                    // @ts-ignore
                    for (const key in pageObjs._objs) {
                        // @ts-ignore
                        checkFont(pageObjs._objs[key], 'page.objs._objs');
                    }
                }
            }
        }

        log(`Analysis complete. Found ${fonts.size} unique fonts.`);
        return {
            fonts: Array.from(fonts.values()),
            logs
        };

    } catch (e: any) {
        log(`CRITICAL ERROR: ${e.message}`);
        console.error(e);
        return {
            fonts: [],
            logs
        };
    }
}
