import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../FileUpload'

describe('FileUpload', () => {
  const mockOnFileUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ファイルアップロードエリアが表示される', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    expect(screen.getByText('PDFファイルをドラッグ&ドロップ')).toBeInTheDocument()
    expect(screen.getByText('またはクリックしてファイルを選択')).toBeInTheDocument()
  })

  it('ファイル選択時に適切なファイル名が表示される', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, file)
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('PDFファイル以外を選択した場合はエラーメッセージが表示される', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, file)
    
    expect(screen.getByText('PDFファイルのみアップロード可能です')).toBeInTheDocument()
    expect(mockOnFileUpload).not.toHaveBeenCalled()
  })

  it('有効なPDFファイル選択時にonFileUploadが呼ばれる', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, file)
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file)
    })
  })

  it('ドラッグ&ドロップでファイルアップロードできる', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    render(<FileUpload onFileUpload={mockOnFileUpload} />)
    
    const dropzone = screen.getByTestId('dropzone')
    
    fireEvent.dragEnter(dropzone)
    fireEvent.dragOver(dropzone)
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file)
    })
  })

  it('アップロード中の状態が表示される', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} isUploading={true} />)
    
    expect(screen.getByText('アップロード中...')).toBeInTheDocument()
  })
})