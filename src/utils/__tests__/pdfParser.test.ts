import { extractTextFromPdf, PDFParseResult } from '../pdfParser'

// Mock PDF.js
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn()
}))

const mockPdfJs = require('pdfjs-dist')

describe('pdfParser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractTextFromPdf', () => {
    it('PDFファイルからテキストを正常に抽出できる', async () => {
      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue({
          items: [
            { str: 'Hello' },
            { str: ' ' },
            { str: 'World' },
            { str: '\n' },
            { str: 'This is a test PDF.' }
          ]
        })
      }

      const mockPdf = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage)
      }

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(true)
      expect(result.pages).toHaveLength(1)
      expect(result.pages![0].text).toBe('Hello World\nThis is a test PDF.')
      expect(result.pages![0].pageNumber).toBe(1)
    })

    it('複数ページのPDFから全ページのテキストを抽出できる', async () => {
      const mockPage1 = {
        getTextContent: jest.fn().mockResolvedValue({
          items: [{ str: 'Page 1 content' }]
        })
      }

      const mockPage2 = {
        getTextContent: jest.fn().mockResolvedValue({
          items: [{ str: 'Page 2 content' }]
        })
      }

      const mockPdf = {
        numPages: 2,
        getPage: jest.fn()
          .mockResolvedValueOnce(mockPage1)
          .mockResolvedValueOnce(mockPage2)
      }

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(true)
      expect(result.pages).toHaveLength(2)
      expect(result.pages![0].text).toBe('Page 1 content')
      expect(result.pages![0].pageNumber).toBe(1)
      expect(result.pages![1].text).toBe('Page 2 content')
      expect(result.pages![1].pageNumber).toBe(2)
    })

    it('空のPDFページの場合は空文字列を返す', async () => {
      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue({
          items: []
        })
      }

      const mockPdf = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage)
      }

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(true)
      expect(result.pages).toHaveLength(1)
      expect(result.pages![0].text).toBe('')
    })

    it('PDFの読み込みに失敗した場合はエラーを返す', async () => {
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.reject(new Error('Invalid PDF'))
      })

      const file = new File(['invalid'], 'invalid.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(false)
      expect(result.error).toBe('PDFの解析に失敗しました')
    })

    it('ページの読み込みに失敗した場合はエラーを返す', async () => {
      const mockPdf = {
        numPages: 1,
        getPage: jest.fn().mockRejectedValue(new Error('Page load error'))
      }

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(false)
      expect(result.error).toBe('PDFの解析に失敗しました')
    })

    it('テキスト抽出に失敗した場合はエラーを返す', async () => {
      const mockPage = {
        getTextContent: jest.fn().mockRejectedValue(new Error('Text extraction error'))
      }

      const mockPdf = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage)
      }

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await extractTextFromPdf(file)

      expect(result.success).toBe(false)
      expect(result.error).toBe('PDFの解析に失敗しました')
    })
  })
})