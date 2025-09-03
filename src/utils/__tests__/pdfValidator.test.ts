import { validatePdfFile, isPdfFile } from '../pdfValidator'

describe('pdfValidator', () => {
  describe('isPdfFile', () => {
    it('PDFファイルの場合はtrueを返す', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      expect(isPdfFile(pdfFile)).toBe(true)
    })

    it('PDFファイル以外の場合はfalseを返す', () => {
      const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(isPdfFile(txtFile)).toBe(false)
    })

    it('MIMEタイプがapplication/pdfの場合はtrueを返す', () => {
      const pdfFile = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      expect(isPdfFile(pdfFile)).toBe(true)
    })

    it('ファイル拡張子がpdfでもMIMEタイプが異なる場合はfalseを返す', () => {
      const fakeFile = new File(['test'], 'fake.pdf', { type: 'text/plain' })
      expect(isPdfFile(fakeFile)).toBe(false)
    })
  })

  describe('validatePdfFile', () => {
    it('有効なPDFファイルの場合は成功レスポンスを返す', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = validatePdfFile(pdfFile)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('無効なファイルの場合はエラーメッセージを返す', () => {
      const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = validatePdfFile(txtFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('PDFファイルのみアップロード可能です')
    })

    it('ファイルサイズが大きすぎる場合はエラーメッセージを返す', () => {
      // 20MB以上のファイルサイズをシミュレート
      const largeContent = new Array(20 * 1024 * 1024 + 1).fill('a').join('')
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      const result = validatePdfFile(largeFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('ファイルサイズは20MB以下にしてください')
    })

    it('空のファイルの場合はエラーメッセージを返す', () => {
      const emptyFile = new File([''], 'empty.pdf', { type: 'application/pdf' })
      const result = validatePdfFile(emptyFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('ファイルが空です')
    })
  })
})