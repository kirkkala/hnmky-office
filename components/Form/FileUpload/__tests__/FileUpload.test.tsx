import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import FileUpload from "../FileUpload"

const createMockFile = (name: string, size = 1024) =>
  new File(["x".repeat(size)], name, {
    type: "text/csv",
  })

describe("FileUpload", () => {
  it("renders an accessible file input", () => {
    render(<FileUpload label="eLSA excel tiedosto" files={[]} onFilesChange={vi.fn()} />)
    expect(screen.getByLabelText("eLSA excel tiedosto")).toBeInTheDocument()
  })

  it("shows dropzone instructions when no files", () => {
    render(<FileUpload files={[]} onFilesChange={vi.fn()} />)
    expect(
      screen.getByText("Pudota eLSA:n .csv -tiedosto tai klikkaa valitaksesi")
    ).toBeInTheDocument()
    expect(screen.getByText("Tuetut tiedostomuodot: .csv")).toBeInTheDocument()
  })

  it("displays the uploaded file", () => {
    render(<FileUpload files={[createMockFile("test.csv")]} onFilesChange={vi.fn()} />)

    expect(screen.getByText("test.csv")).toBeInTheDocument()
    expect(screen.getByText("Tiedosto lisätty")).toBeInTheDocument()
  })

  it("calls onFilesChange when a file is selected", async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload files={[]} onFilesChange={onFilesChange} />)

    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [createMockFile("test.csv")] },
    })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalled()
    })
  })

  it("removes the file", () => {
    const onFilesChange = vi.fn()
    const file = createMockFile("test.csv")
    render(<FileUpload files={[file]} onFilesChange={onFilesChange} />)

    const chip = screen.getByText("test.csv").closest(".MuiChip-root")
    const deleteIcon = chip?.querySelector(".MuiChip-deleteIcon")
    expect(deleteIcon).toBeInTheDocument()
    if (!deleteIcon) throw new Error("delete icon missing")
    fireEvent.click(deleteIcon)

    expect(onFilesChange).toHaveBeenCalledWith([])
  })

  it("replaces the file when another one is chosen", async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload files={[createMockFile("old.csv")]} onFilesChange={onFilesChange} />)

    fireEvent.change(screen.getByTestId("file-input"), {
      target: { files: [createMockFile("new.csv")] },
    })

    await waitFor(() => {
      expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: "new.csv" })])
    })
  })
})
