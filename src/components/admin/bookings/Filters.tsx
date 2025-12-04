import React, { useEffect, useState } from 'react';

type Props = {
  onChange: (q: Record<string, any>) => void;
  initial: Record<string, any>;
};

export default function Filters({ onChange, initial }: Props) {
  const [keyword, setKeyword] = useState(initial.keyword || '');
  const [status, setStatus] = useState<string[]>(initial.status || []);

  function toggleStatus(s: string) {
    setStatus((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  // Notify parent after render when status changes (avoids updating parent during child render)
  useEffect(() => {
    if (!Array.isArray(status)) return;
    onChange({ keyword, status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="controls">
      <input
        className="input"
        placeholder="Tìm mã đơn, tên, số điện thoại"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onBlur={() => onChange({ keyword, status })}
      />
      {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
        <label key={s} className="checkbox">
          <input type="checkbox" checked={status.includes(s)} onChange={() => toggleStatus(s)} /> {s}
        </label>
      ))}
    </div>
  );
}


