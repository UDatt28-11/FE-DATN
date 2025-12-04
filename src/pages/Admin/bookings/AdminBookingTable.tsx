/**
 FILE GUARD – ADMIN BOOKING PAGES ONLY
 - Không lib mới; không code ngoài /admin/bookings.
*/
import React, { useEffect, useMemo, useState } from 'react';
import { listBookings, updateBookingStatus } from '../../../api/booking';
import type { BookingOrder } from '../../../types/booking';
import Filters from '../../../components/admin/bookings/Filters';
import StatusTag from '../../../components/admin/bookings/StatusTag';
import StatusModal from '../../../components/admin/bookings/StatusModal';
import { Link, useSearchParams } from 'react-router-dom';

export default function AdminBookingTable() {
  const [params, setParams] = useSearchParams();
  const initial = useMemo(() => ({
    keyword: params.get('keyword') || '',
    status: params.get('status')?.split(',').filter(Boolean) || [],
    page: Number(params.get('page') || 1),
  }), [params]);

  const [q, setQ] = useState(initial);
  const [rows, setRows] = useState<BookingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; per_page: number; total: number; last_page: number } | undefined>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (q.keyword) next.set('keyword', q.keyword);
    if (q.status?.length) next.set('status', q.status.join(','));
    if (q.page && q.page !== 1) next.set('page', String(q.page));
    setParams(next, { replace: true });
  }, [q, setParams]);

  async function fetchData() {
    setLoading(true); setError(null);
    try {
      const { data, pagination } = await listBookings({ keyword: q.keyword, status: q.status, page: q.page });
      setRows(data);
      setPagination(pagination);
    } catch (e: any) {
      setError(e.userMessage || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [q.keyword, q.status, q.page]);

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Quản lý Đặt phòng</div>
          <div className="controls">
            <button className="btn" onClick={() => fetchData()} title="Làm mới">↻</button>
          </div>
        </div>
        <div className="card-body">
          <Filters initial={initial} onChange={(next) => setQ((p) => ({ ...p, ...next, page: 1 }))} />
          {loading && (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Trạng thái</th><th style={{textAlign:'right'}}>Tổng tiền</th><th></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="row">
                    <td><div className="skeleton" style={{width:90}}/></td>
                    <td><div className="skeleton" style={{width:180}}/></td>
                    <td><div className="skeleton" style={{width:160}}/></td>
                    <td><div className="skeleton" style={{width:80}}/></td>
                    <td><div className="skeleton" style={{width:100, marginLeft:'auto'}}/></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error && <div className="error">{error}</div>}
          {!loading && !rows.length && <div className="empty">Không có dữ liệu</div>}

          {!!rows.length && (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="row">
                    <td><Link to={`/admin/bookings/${r.id}`}>{r.code}</Link></td>
                    <td>{r.customer_name} ({r.customer_phone})</td>
                    <td>{r.checkin_date} → {r.checkout_date}</td>
                    <td><StatusTag status={r.status} /></td>
                    <td style={{ textAlign: 'right' }}>{r.total_amount.toLocaleString('vi-VN')}</td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status !== 'completed' && r.status !== 'cancelled' && (
                        <button className="btn ghost" onClick={() => setSelectedId(r.id)}>Đổi trạng thái</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination && (
            <div className="pagination">
              <button className="btn" disabled={q.page <= 1} onClick={() => setQ((p) => ({ ...p, page: p.page - 1 }))}>Trước</button>
              <div>Trang {pagination.page}/{pagination.last_page}</div>
              <button className="btn" disabled={q.page >= (pagination.last_page || 1)} onClick={() => setQ((p) => ({ ...p, page: p.page + 1 }))}>Sau</button>
            </div>
          )}
        </div>
      </div>

      <StatusModal
        open={selectedId != null}
        onClose={() => setSelectedId(null)}
        onSubmit={async (status) => {
          if (!selectedId) return;
          const id = selectedId;
          setRows((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
          try {
            await updateBookingStatus(id, status);
          } catch (e) {
            await fetchData();
          }
        }}
      />
    </div>
  );
}


