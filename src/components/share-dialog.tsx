"use client"

import { useState } from "react"
import { useShare } from "@/hooks/use-share"
import { Button } from "@/components/ui/button"
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
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the compiled PDF (read-only).
          </DialogDescription>
        </DialogHeader>
        
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive py-4">
            {error}
          </div>
        ) : shareUrl ? (
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopy} variant="outline">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
