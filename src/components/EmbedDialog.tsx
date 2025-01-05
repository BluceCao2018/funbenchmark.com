'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface EmbedDialogProps {
  isOpen: boolean
  onClose: () => void
  embedUrl: string
}

export function EmbedDialog({ isOpen, onClose, embedUrl }: EmbedDialogProps) {
  const t = useTranslations('embed')
  
  const copyEmbedCode = () => {
    const code = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`
    navigator.clipboard.writeText(code)
    toast.success(t('codeCopied'))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md relative">
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
              {`<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`}
            </pre>
          </div>
          
          <Button
            className="w-full"
            onClick={copyEmbedCode}
          >
            <Copy className="h-4 w-4 mr-2" />
            {t('copyCode')}
          </Button>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t('instructions1')}</p>
            <p>{t('instructions2')}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('instruction1')}</li>
              <li>{t('instruction2')}</li>
              <li>{t('instruction3')}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 