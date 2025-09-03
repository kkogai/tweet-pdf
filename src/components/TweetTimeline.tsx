import { useState, useEffect, useRef } from 'react'
import { PDFPage, PDFContentItem } from '@/utils/pdfParser'

interface TweetTimelineProps {
  pages: PDFPage[]
}

interface TweetCardProps {
  item: PDFContentItem & { pageNumber: number }
  pageNumber: number
  onImageClick: (imageData: string, pageNumber: number) => void
}

interface ImageModalProps {
  isOpen: boolean
  imageData: string
  pageNumber: number
  onClose: () => void
}

function ImageModal({ isOpen, imageData, pageNumber, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // スクロールを防ぐ
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-w-5xl max-h-screen bg-white rounded-lg shadow-xl overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Page {pageNumber} - Full View
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 画像 */}
        <div className="p-4 max-h-[calc(100vh-120px)] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageData}
            alt={`PDF page ${pageNumber} - expanded view`}
            className="w-full h-auto"
          />
        </div>
      </div>
      
      {/* 背景クリックで閉じる */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  )
}

function TweetCard({ item, pageNumber, onImageClick }: TweetCardProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const getAvatarColor = (pageNumber: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ]
    return colors[(pageNumber - 1) % colors.length]
  }

  return (
    <div
      data-testid="tweet-card"
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
    >
      <div className="p-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start mb-3">
          <div className={`w-12 h-12 ${getAvatarColor(pageNumber)} rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0`}>
            {item.type === 'image' ? '📷' : pageNumber}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">
                {item.type === 'image' ? 'PDF Image' : 'PDF Document'}
              </h3>
              <span className="ml-2 text-sm text-gray-500">@pdf-page-{pageNumber}</span>
              <span className="ml-2 text-sm text-gray-500">•</span>
              <span className="ml-2 text-sm text-gray-500">{formatTime(item.timestamp)}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Page {pageNumber}
              </span>
              {item.type === 'image' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Image
                </span>
              )}
            </div>
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="ml-15">
          {item.type === 'text' ? (
            <div className="text-gray-900 leading-relaxed text-sm whitespace-pre-wrap mb-3">
              {item.content || '（コンテンツが読み込めませんでした）'}
            </div>
          ) : (
            <div className="mb-3">
              {item.imageData ? (
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">{item.content}</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-300 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.imageData} 
                      alt={`PDF page ${pageNumber} visual content`}
                      className="w-full h-auto max-h-96 object-contain hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={() => onImageClick(item.imageData!, pageNumber)}
                    />
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    クリックで拡大表示
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm mb-2">{item.content}</p>
              )}
            </div>
          )}

          {/* アクション部分 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex space-x-6">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs">Reply</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs">Retweet</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs">Like</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors group">
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-xs">Share</span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {item.type === 'text' ? `${item.content.length} chars` : 'Image'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TweetTimeline({ pages }: TweetTimelineProps) {
  const [modalImage, setModalImage] = useState<{imageData: string, pageNumber: number} | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // タイムライン表示後に最下部にスクロール
  useEffect(() => {
    if (pages && pages.length > 0 && bottomRef.current) {
      // 最下部の要素にスクロール
      const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        })
      }

      // レンダリング完了を待って段階的にスクロール
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 100)
        setTimeout(scrollToBottom, 500)
        setTimeout(scrollToBottom, 1500)
      })
    }
  }, [pages])
  
  if (!pages || pages.length === 0) {
    return null
  }

  // 全てのコンテンツアイテムを統合し、タイムスタンプでソート（新しいものが上）
  const allContentItems = pages
    .flatMap(page => 
      page.contentItems.map((item: PDFContentItem) => ({ ...item, pageNumber: page.pageNumber }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const handleImageClick = (imageData: string, pageNumber: number) => {
    setModalImage({ imageData, pageNumber })
  }

  const handleModalClose = () => {
    setModalImage(null)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Twitter風ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-900">PDF Timeline</h2>
        <p className="text-sm text-gray-600">{allContentItems.length} items from {pages.length} pages</p>
      </div>
      
      {/* タイムライン（新しい投稿が上） */}
      <div className="space-y-3">
        {allContentItems.map((item, index) => (
          <TweetCard
            key={`${item.pageNumber}-${index}-${item.timestamp}`}
            item={item}
            pageNumber={item.pageNumber}
            onImageClick={handleImageClick}
          />
        ))}
      </div>
      
      {/* 最下部のメッセージ */}
      <div ref={bottomRef} className="text-center py-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          PDFの全内容を読み込みました
        </div>
      </div>
      
      {/* 画像拡大モーダル */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          imageData={modalImage.imageData}
          pageNumber={modalImage.pageNumber}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}