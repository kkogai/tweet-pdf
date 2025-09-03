import { PDFPage } from '@/utils/pdfParser'

interface TweetTimelineProps {
  pages: PDFPage[]
}

export function TweetTimeline({ pages }: TweetTimelineProps) {
  if (!pages || pages.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          data-testid="tweet-card"
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          {/* ヘッダー部分 */}
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900">PDF Document</h3>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Page {page.pageNumber}
                </span>
              </div>
              <p className="text-sm text-gray-500">@pdf-viewer • now</p>
            </div>
          </div>

          {/* コンテンツ部分 */}
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {page.text || '（このページにはテキストコンテンツがありません）'}
          </div>

          {/* アクション部分 */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex space-x-6">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">Reply</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Retweet</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm">Share</span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {page.text.length} characters
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}