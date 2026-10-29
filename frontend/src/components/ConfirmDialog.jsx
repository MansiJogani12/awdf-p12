import { useEffect, useRef } from 'react';

// Uses the native <dialog> element: it handles focus trapping and Esc for us.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" onCancel={onCancel}>
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      <div className="dialog-actions">
        <button className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="solid danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
