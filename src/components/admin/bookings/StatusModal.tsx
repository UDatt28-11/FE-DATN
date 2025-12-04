import React, { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (status: 'confirmed' | 'completed' | 'cancelled') => Promise<void> | void;
};

export default function StatusModal({ open, onClose, onSubmit }: Props) {
  const [status, setStatus] = useState<'confirmed' | 'completed' | 'cancelled'>('confirmed');
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>Đổi trạng thái</header>
        <div className="content">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input" style={{ width: '100%' }}>
            <option value="confirmed">confirmed</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <footer>
          <button className="btn ghost" onClick={onClose}>Hủy</button>
          <button
            className="btn primary"
            onClick={async () => {
              await onSubmit(status);
              onClose();
            }}
          >
            Xác nhận
          </button>
        </footer>
      </div>
    </div>
  );
}


