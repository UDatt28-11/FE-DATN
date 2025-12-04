import React from 'react';

type Props = { status: 'pending' | 'confirmed' | 'cancelled' | 'completed' };

export default function StatusTag({ status }: Props) {
  return <span className={`badge ${status}`}>{status}</span>;
}


