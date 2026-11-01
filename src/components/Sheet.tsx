import { useEffect, useRef, type ReactNode } from 'react'
import './Sheet.css'

/** A modal that slides up from the bottom on phones and sits centred on wider screens. */
export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={label}
      onCancel={(e) => (e.preventDefault(), onClose())}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="sheet__body">
        <span className="sheet__grip" aria-hidden="true" />
        {children}
      </div>
    </dialog>
  )
}
