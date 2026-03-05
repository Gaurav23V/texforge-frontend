"use client"

import { useState } from "react"
import { useShare } from "@/hooks/use-share"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, Loader2 } from "lucide-react"

interface ShareDialogProps {
  projectId: string
}

export function ShareDialog({ projectId }: ShareDialogProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { shareUrl, isGenerating, error, generateShareLink, copyToClipboard } = useShare(projectId)

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !shareUrl) {
      await generateShareLink()
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the compiled PDF (read-only).
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              className="surface-elevated flex items-center justify-center py-10"
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={reduceMotion ? undefined : { duration: 0.2 }}
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={reduceMotion ? undefined : { duration: 0.2 }}
            >
              {error}
            </motion.div>
          ) : shareUrl ? (
            <motion.div
              key="url"
              className="space-y-3"
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={reduceMotion ? undefined : { duration: 0.2 }}
            >
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" aria-label="Share URL" />
                <Button onClick={handleCopy} variant="outline" aria-label="Copy share URL">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The shared page is read-only and always serves the latest compiled PDF.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
