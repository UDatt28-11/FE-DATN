import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Clients/Home';
import About from './pages/About';
import Services from './pages/Services';
import RoomList from './pages/Clients/Rooms/RoomList';
import RoomDetailPage from './pages/Clients/Rooms/RoomDetailPage';
import BookingInfoPage from './pages/Clients/Booking/BookingInfoPage';
import PaymentPage from './pages/Clients/Booking/PaymentPage';
import MyBookingsPage from './pages/Clients/Booking/MyBookingsPage';
import Promotions from './pages/Clients/Promotions/Promotions';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ScrollToTop from './components/shared/ScrollToTop';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const { Content } = Layout;

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#cb8670',
          colorLink: '#cb8670',
          colorLinkHover: '#a96d5a',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <Router>
        <ScrollToTop />
        <Layout style={{ minHeight: '100vh' }}>
          <Header />
          <Content style={{ marginTop: '0' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/booking/info" element={<BookingInfoPage />} />
              <Route path="/booking/payment" element={<PaymentPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Content>
          <Footer />
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
