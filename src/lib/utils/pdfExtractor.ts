import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Required in Next.js to find worker - use a more reliable CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Extracts text from a PDF (digital, not scanned)
 * @param {string|Uint8Array} pdfSource - PDF file URL or ArrayBuffer/Uint8Array
 * @returns {Promise<string>} extracted text
 */
export async function extractTextFromPDF(pdfSource: string | Uint8Array): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfSource);
    const pdf = await loadingTask.promise;
    
    const totalPageCount = pdf.numPages;
    const countPromises: Promise<string>[] = [];
    
    // Process each page
    for (let currentPage = 1; currentPage <= totalPageCount; currentPage++) {
      const page = pdf.getPage(currentPage);
      countPromises.push(
        page.then(function (page) {
          const textContent = page.getTextContent();
          return textContent.then(function (text) {
            return text.items
              .map(function (s: any) {
                return s.str;
              })
              .join('');
          });
        })
      );
    }

    // Wait for all pages to be processed and join the text
    const texts = await Promise.all(countPromises);
    return texts.join('\n\n');
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts text from a specific page of a PDF
 * @param {string|Uint8Array} pdfSource - PDF file URL or ArrayBuffer/Uint8Array
 * @param {number} pageIndex - Page index (0-based)
 * @returns {Promise<string>} extracted text from the specified page
 */
export async function extractTextFromPage(pdfSource: string | Uint8Array, pageIndex: number): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfSource);
    const pdf = await loadingTask.promise;
    
    if (pageIndex < 0 || pageIndex >= pdf.numPages) {
      throw new Error(`Page index ${pageIndex} is out of range. PDF has ${pdf.numPages} pages.`);
    }
    
    const page = await pdf.getPage(pageIndex + 1); // PDF.js uses 1-based page numbers
    const textContent = await page.getTextContent();
    
    return textContent.items
      .map((item: any) => item.str)
      .join('');
      
  } catch (error) {
    console.error('Error extracting text from PDF page:', error);
    throw new Error(`PDF page text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
