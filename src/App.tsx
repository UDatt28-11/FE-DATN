import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminBookingTable from './pages/admin/bookings/AdminBookingTable';
import AdminBookingDetail from './pages/admin/bookings/AdminBookingDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/bookings" element={<AdminBookingTable />} />
        <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
        <Route path="*" element={<Navigate to="/admin/bookings" replace />} />
      </Routes>
    </BrowserRouter>
  );
}




