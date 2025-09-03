import { render, screen } from '@testing-library/react'
import { TweetTimeline } from '../TweetTimeline'

interface PDFPage {
  pageNumber: number
  text: string
}

describe('TweetTimeline', () => {
  const mockPages: PDFPage[] = [
    {
      pageNumber: 1,
      text: 'これは最初のページの内容です。とても興味深い内容が書かれています。'
    },
    {
      pageNumber: 2,
      text: '2ページ目にはさらに詳細な情報があります。技術的な内容も含まれています。'
    },
    {
      pageNumber: 3,
      text: '最後のページには結論が書かれています。'
    }
  ]

  it('PDF内容がTwitter風のタイムライン形式で表示される', () => {
    render(<TweetTimeline pages={mockPages} />)
    
    // 各ページの内容が表示されることを確認
    expect(screen.getByText(/これは最初のページの内容/)).toBeInTheDocument()
    expect(screen.getByText(/2ページ目にはさらに詳細/)).toBeInTheDocument()
    expect(screen.getByText(/最後のページには結論/)).toBeInTheDocument()
  })

  it('各ページがツイート風のカードとして表示される', () => {
    render(<TweetTimeline pages={mockPages} />)
    
    // ツイートカードのコンテナが存在することを確認
    const tweetCards = screen.getAllByTestId('tweet-card')
    expect(tweetCards).toHaveLength(3)
  })

  it('ページ番号が表示される', () => {
    render(<TweetTimeline pages={mockPages} />)
    
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByText('Page 3')).toBeInTheDocument()
  })

  it('空のページ配列の場合は何も表示されない', () => {
    render(<TweetTimeline pages={[]} />)
    
    const tweetCards = screen.queryAllByTestId('tweet-card')
    expect(tweetCards).toHaveLength(0)
  })

  it('Twitter風のスタイリングが適用される', () => {
    render(<TweetTimeline pages={mockPages} />)
    
    const tweetCards = screen.getAllByTestId('tweet-card')
    
    // 各カードにTwitter風のクラスが適用されていることを確認
    tweetCards.forEach(card => {
      expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'shadow-sm')
    })
  })

  it('長いテキストは適切に表示される', () => {
    const longTextPages: PDFPage[] = [
      {
        pageNumber: 1,
        text: 'これは非常に長いテキストの例です。'.repeat(50)
      }
    ]

    render(<TweetTimeline pages={longTextPages} />)
    
    const tweetCard = screen.getByTestId('tweet-card')
    expect(tweetCard).toBeInTheDocument()
  })

  it('特殊文字が正しく表示される', () => {
    const specialCharPages: PDFPage[] = [
      {
        pageNumber: 1,
        text: '特殊文字のテスト: & < > " \' \n改行も含まれています。'
      }
    ]

    render(<TweetTimeline pages={specialCharPages} />)
    
    expect(screen.getByText(/特殊文字のテスト/)).toBeInTheDocument()
    expect(screen.getByText(/改行も含まれています/)).toBeInTheDocument()
  })
})