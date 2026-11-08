import { useEffect, useRef, useState, type ReactNode } from 'react'
import './Sheet.css'

const CLOSE_MS = 180

/** A modal that slides up from the bottom on phones and sits centred on wider screens. */
export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  // Slide back down before unmounting, unless she asked for reduced motion.
  function close() {
    if (closing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return onClose()
    setClosing(true)
    window.setTimeout(onClose, CLOSE_MS)
  }

  return (
    <dialog
      ref={ref}
      className={`sheet${closing ? ' is-closing' : ''}`}
      aria-label={label}
      onCancel={(e) => (e.preventDefault(), close())}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div className="sheet__body">
        <span className="sheet__grip" aria-hidden="true" />
        {children}
      </div>
    </dialog>
  )
}
