import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PdfViewer } from "@/components/pdf-viewer"

describe("PdfViewer", () => {
  it("renders loading state when latest PDF is being hydrated", () => {
    render(<PdfViewer url={null} isLoading />)
    expect(screen.getByText("Loading latest PDF...")).toBeInTheDocument()
  })

  it("renders empty state without URL", () => {
    render(<PdfViewer url={null} />)
    expect(screen.getByText("No PDF yet")).toBeInTheDocument()
  })

  it("renders iframe with provided URL", () => {
    render(<PdfViewer url="https://example.com/file.pdf?v=1" />)
    const iframe = screen.getByTitle("PDF Preview")
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute("src", "https://example.com/file.pdf?v=1")
  })
})
