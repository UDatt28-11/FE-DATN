/**
 FILE GUARD – ADMIN BOOKING PAGES ONLY
*/
import React, { useEffect, useState } from 'react';
import { getBooking, updateBookingStatus } from '../../../api/booking';
import type { BookingOrder } from '../../../types/booking';
import { Link, useParams } from 'react-router-dom';
import StatusTag from '../../../components/admin/bookings/StatusTag';
import StatusModal from '../../../components/admin/bookings/StatusModal';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const [data, setData] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  async function fetchData() {
    setLoading(true); setError(null);
    try {
      const d = await getBooking(Number(id), 'details,details.room,details.guests');
      setData(d);
    } catch (e: any) {
      setError(e.userMessage || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="container"><div className="empty">Đang tải...</div></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!data) return null;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Đơn {data.code}</div>
          <div><StatusTag status={data.status} /></div>
        </div>
        <div className="card-body">
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:8 }}>
            <div><strong>Khách:</strong> {data.customer_name} ({data.customer_phone})</div>
            <div><strong>Ngày:</strong> {data.checkin_date} → {data.checkout_date}</div>
            <div><strong>Tổng:</strong> {data.total_amount.toLocaleString('vi-VN')}</div>
            {data.status !== 'completed' && data.status !== 'cancelled' && (
              <button className="btn ghost" onClick={() => setOpenModal(true)}>Đổi trạng thái</button>
            )}
            <Link className="btn" to="/admin/bookings">← Quay lại</Link>
          </div>

          <h3 style={{ margin:'12px 0 6px 0' }}>Chi tiết phòng</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Ngày</th>
                <th>Khách</th>
                <th>Subtotal</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.details?.map((d) => (
                <tr key={d.id} className="row">
                  <td>{d.room_name}</td>
                  <td>{d.check_in_date} → {d.check_out_date}</td>
                  <td>{d.guests?.map((g) => g.full_name).join(', ')}</td>
                  <td>{d.sub_total.toLocaleString('vi-VN')}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={async (status) => {
          setData((prev) => (prev ? { ...prev, status } : prev));
          try {
            await updateBookingStatus(Number(id), status);
          } catch (e) {
            await fetchData();
          }
        }}
      />
    </div>
  );
}


