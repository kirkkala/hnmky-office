import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import FileUpload from "../FileUpload"

const createMockFile = (name: string, size = 1024) =>
  new File(["x".repeat(size)], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

const mockProps = {
  label: "eLSA excel tiedosto",
  description: "Valitse Excel tiedosto",
  files: [] as File[],
  onFilesChange: vi.fn(),
}

describe("FileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders an accessible file input and description", () => {
    render(<FileUpload {...mockProps} />)
    expect(screen.getByLabelText("eLSA excel tiedosto")).toBeInTheDocument()
    expect(screen.getByText("Valitse Excel tiedosto")).toBeInTheDocument()
  })

  it("shows dropzone instructions when no files", () => {
    render(<FileUpload {...mockProps} />)
    expect(screen.getByText("Pudota eLSA-Excel tai klikkaa valitaksesi")).toBeInTheDocument()
    expect(screen.getByText("Tuetut tiedostomuodot: .xlsx")).toBeInTheDocument()
  })

  it("displays uploaded files as chips", () => {
    const files = [createMockFile("test1.xlsx"), createMockFile("test2.xlsx")]
    render(<FileUpload {...mockProps} files={files} />)

    expect(screen.getByText("test1.xlsx")).toBeInTheDocument()
    expect(screen.getByText("test2.xlsx")).toBeInTheDocument()
    expect(screen.getByText("2 tiedostoa lisätty")).toBeInTheDocument()
  })

  it("calls onFilesChange when files are selected via input", async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload {...mockProps} onFilesChange={onFilesChange} />)

    const input = screen.getByTestId("file-input")
    const file = createMockFile("test.xlsx")

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalled()
    })
  })

  it("allows removing individual files", () => {
    const onFilesChange = vi.fn()
    const files = [createMockFile("test1.xlsx"), createMockFile("test2.xlsx")]
    render(<FileUpload {...mockProps} files={files} onFilesChange={onFilesChange} />)

    const chip = screen.getByText("test1.xlsx").closest(".MuiChip-root")
    const deleteIcon = chip?.querySelector(".MuiChip-deleteIcon")
    expect(deleteIcon).toBeInTheDocument()
    if (!deleteIcon) throw new Error("delete icon missing")
    fireEvent.click(deleteIcon)

    expect(onFilesChange).toHaveBeenCalledWith([files[1]])
  })

  it("replaces the file when only one file is accepted", async () => {
    const onFilesChange = vi.fn()
    const existingFile = createMockFile("old.xlsx")
    render(
      <FileUpload
        {...mockProps}
        files={[existingFile]}
        multiple={false}
        onFilesChange={onFilesChange}
      />
    )

    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [createMockFile("new.xlsx")] },
    })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: "new.xlsx" })])
    })
  })
})
