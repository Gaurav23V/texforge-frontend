"use client"

import { useCallback } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { StreamLanguage } from "@codemirror/language"
import { githubLight } from "@uiw/codemirror-theme-github"

const stexLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^\\[a-zA-Z]+/)) {
      return "keyword"
    }
    if (stream.match(/^%[^\n]*/)) {
      return "comment"
    }
    if (stream.match(/^\{/)) {
      return "bracket"
    }
    if (stream.match(/^\}/)) {
      return "bracket"
    }
    if (stream.match(/^\$/)) {
      return "atom"
    }
    if (stream.match(/^\[/)) {
      return "bracket"
    }
    if (stream.match(/^\]/)) {
      return "bracket"
    }
    stream.next()
    return null
  },
})

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function LatexEditor({ value, onChange, readOnly = false }: LatexEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val)
    },
    [onChange]
  )

  return (
    <div className="h-full w-full overflow-hidden border rounded-md">
      <CodeMirror
        value={value}
        height="100%"
        theme={githubLight}
        extensions={[stexLanguage]}
        onChange={handleChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          autocompletion: false,
        }}
        className="h-full text-sm"
      />
    </div>
  )
}
