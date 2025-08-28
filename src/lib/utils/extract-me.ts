import { pdfToText } from 'pdf-ts';

export const extractMe = async (file: File) => {
  try {
    // Convert File to ArrayBuffer, then to Buffer for pdf-ts
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfText = await pdfToText(buffer);
    console.log("this is the pdfText", pdfText);
    return pdfText;
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
};