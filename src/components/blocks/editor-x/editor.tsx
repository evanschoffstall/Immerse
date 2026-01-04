// @ts-nocheck - Lexical editor uses non-serializable props which is valid for client components
"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState, SerializedEditorState } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  className,
}: {
  // @ts-expect-error - Client component with non-serializable props is valid
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  // @ts-expect-error - Client component callbacks are valid
  onChange?: (editorState: EditorState) => void
  // @ts-expect-error - Client component callbacks are valid
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  className?: string
}) {
  return (
    <div className={`bg-background overflow-hidden rounded-lg border shadow ${className || ''}`}>
      <LexicalComposer
        key={className}
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins className={className} />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
