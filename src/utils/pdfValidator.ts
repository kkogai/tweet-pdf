export interface PdfValidationResult {
  isValid: boolean
  error?: string
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}

export function validatePdfFile(file: File): PdfValidationResult {
  // ファイルが空でないかチェック
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'ファイルが空です'
    }
  }

  // PDFファイルかチェック
  if (!isPdfFile(file)) {
    return {
      isValid: false,
      error: 'PDFファイルのみアップロード可能です'
    }
  }

  // ファイルサイズが10MB以下かチェック
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'ファイルサイズは10MB以下にしてください'
    }
  }

  return {
    isValid: true
  }
}