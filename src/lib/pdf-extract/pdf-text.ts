import { PDFParse } from 'pdf-parse';

export async function pdfToText(pdf: Buffer): Promise<string> {
  const parser = new PDFParse({ data: pdf });
  try {
    const result = await parser.getText();
    return (result.text || '').slice(0, 100_000);
  } finally {
    await parser.destroy();
  }
}
