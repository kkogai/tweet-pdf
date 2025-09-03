// PDF.js動的インポート（SSR対応）
import type { PDFPageProxy, TextItem } from 'pdfjs-dist/types/src/display/api'
import type { PageViewport } from 'pdfjs-dist/types/src/display/display_utils'

export interface PDFContentItem {
  type: 'text' | 'image'
  content: string
  imageData?: string
  timestamp: string
  pageNumber?: number
}

export interface PDFPage {
  pageNumber: number
  text: string
  contentItems: PDFContentItem[]
  images: string[]
}

export interface PDFParseResult {
  success: boolean
  pages?: PDFPage[]
  error?: string
}

// テキストを意味のある単位で分割する関数
function splitTextIntoChunks(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // 段落、改行、句読点で分割
  const paragraphs = text.split(/\n\s*\n|。\s*|！\s*|？\s*/)
    .filter(chunk => chunk.trim().length > 0)
    .map(chunk => chunk.trim())

  const chunks: string[] = []
  
  for (const paragraph of paragraphs) {
    // 長すぎる段落は文で分割
    if (paragraph.length > 200) {
      const sentences = paragraph.split(/[。！？]/).filter(s => s.trim().length > 0)
      
      let currentChunk = ''
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += (currentChunk ? '。' : '') + sentence
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
    } else {
      chunks.push(paragraph)
    }
  }
  
  return chunks.filter(chunk => chunk.length > 10) // 短すぎるものは除外
}

// 画像を抽出する関数
async function extractImagesFromPage(page: PDFPageProxy, viewport: PageViewport): Promise<string[]> {
  try {
    // ページを Canvas にレンダリングして視覚的な内容を取得
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }

    // ページをcanvasにレンダリング
    await page.render(renderContext).promise

    // Canvas から画像データを取得
    const imageDataUrl = canvas.toDataURL('image/png')
    
    // 空白のページかどうかを簡単にチェック
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let hasContent = false
    
    // ピクセルデータをチェックして、白以外の色があるかを確認
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1] 
      const b = data[i + 2]
      // 完全な白(255,255,255)でない場合はコンテンツありと判定
      if (r < 250 || g < 250 || b < 250) {
        hasContent = true
        break
      }
    }

    // コンテンツがある場合のみ画像を返す
    return hasContent ? [imageDataUrl] : []
  } catch (error) {
    console.warn('Failed to extract page image:', error)
    return []
  }
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
    
    // 各ページのテキストと画像を抽出
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      try {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        
        // テキストアイテムを結合
        const fullText = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map(item => item.str)
          .join('')
        
        // 画像を抽出（エラーが発生しても処理を続行）
        let images: string[] = []
        try {
          const viewport = page.getViewport({ scale: 1.0 })
          images = await extractImagesFromPage(page, viewport)
        } catch (imgError) {
          console.warn(`Image extraction failed for page ${pageNumber}:`, imgError)
        }
        
        // テキストを分割してコンテンツアイテムを作成
        const textChunks = splitTextIntoChunks(fullText)
        const contentItems: PDFContentItem[] = []
        
        // テキストがある場合はテキストチャンクを追加
        if (textChunks.length > 0) {
          textChunks.forEach((chunk, index) => {
            const itemTimestamp = Date.now() + (pageNumber * 10000) + (index * 100)
            contentItems.push({
              type: 'text',
              content: chunk,
              timestamp: new Date(itemTimestamp).toISOString()
            })
          })
        }
        
        // 画像を追加
        images.forEach((imageData, index) => {
          const itemTimestamp = Date.now() + (pageNumber * 10000) + ((textChunks.length + index) * 100)
          contentItems.push({
            type: 'image',
            content: `Page ${pageNumber}`,
            imageData,
            timestamp: new Date(itemTimestamp).toISOString()
          })
        })
        
        // テキストも画像もない場合はプレースホルダーを追加
        if (contentItems.length === 0) {
          const itemTimestamp = Date.now() + (pageNumber * 10000)
          contentItems.push({
            type: 'text',
            content: '（このページにはコンテンツが見つかりませんでした）',
            timestamp: new Date(itemTimestamp).toISOString()
          })
        }
        
        pages.push({
          pageNumber,
          text: fullText,
          contentItems,
          images
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