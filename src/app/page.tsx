'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { TweetTimeline } from '@/components/TweetTimeline'
import { extractTextFromPdf, PDFPage } from '@/utils/pdfParser'

export default function Home() {
  const [pages, setPages] = useState<PDFPage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setPages([])

    try {
      const result = await extractTextFromPdf(file)
      
      if (result.success && result.pages) {
        setPages(result.pages)
      } else {
        setError(result.error || 'PDFの処理中にエラーが発生しました')
      }
    } catch (err) {
      console.error('File processing error:', err)
      setError('ファイルの処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PDF Tweet Viewer
            </h1>
            <p className="text-gray-600">
              PDFファイルをアップロードしてTwitter風のタイムラインで表示
            </p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {pages.length === 0 ? (
          <div className="space-y-6">
            <FileUpload
              onFileUpload={handleFileUpload}
              isUploading={isProcessing}
            />
            
            {error && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 使い方セクション */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">使い方</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full mr-3 mt-0.5">1</span>
                    <p>PDFファイルをドラッグ&ドロップまたはクリックして選択</p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full mr-3 mt-0.5">2</span>
                    <p>ファイルが自動的に処理され、各ページの内容が抽出されます</p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full mr-3 mt-0.5">3</span>
                    <p>Twitter風のタイムライン形式で内容を確認できます</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* PDFが表示されている場合のヘッダー */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  PDF内容 ({pages.length}ページ)
                </h2>
                <p className="text-sm text-gray-600">Twitter風表示</p>
              </div>
              <button
                onClick={() => {
                  setPages([])
                  setError(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                新しいファイルを選択
              </button>
            </div>

            {/* Twitter風タイムライン */}
            <TweetTimeline pages={pages} />
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>PDF Tweet Viewer - PDFをTwitter風に表示するツール</p>
        </div>
      </footer>
    </div>
  )
}
