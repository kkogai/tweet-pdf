// PDF.js動的インポート（SSR対応）

export interface PDFPage {
  pageNumber: number
  text: string
}

export interface PDFParseResult {
  success: boolean
  pages?: PDFPage[]
  error?: string
}

export async function extractTextFromPdf(file: File): Promise<PDFParseResult> {
  try {
    // 動的にPDF.jsをインポート（SSR対応）
    const pdfjs = await import('pdfjs-dist')
    
    // PDF.js worker を設定（unpkg CDN使用）
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }
    
    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    
    // PDF文書を読み込み
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    const pages: PDFPage[] = []
    
    // 各ページのテキストを抽出
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      try {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        
        // テキストアイテムを結合
        const text = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => (item as { str: string }).str)
          .join('')
        
        pages.push({
          pageNumber,
          text
        })
      } catch (pageError) {
        console.error(`Error processing page ${pageNumber}:`, pageError)
        throw pageError
      }
    }
    
    return {
      success: true,
      pages
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    return {
      success: false,
      error: 'PDFの解析に失敗しました'
    }
  }
}