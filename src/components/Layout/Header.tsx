import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined, GiftOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';
import ForgotPasswordModal from '../Auth/ForgotPasswordModal';
import { useAuth } from '../../context/AuthContext';
import { getUserBookingCounts } from '../../service/bookingService';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [bookingCounts, setBookingCounts] = useState<{
    active: number;
    all: number;
  }>({ active: 0, all: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Fetch booking counts for navbar
  useEffect(() => {
    const fetchBookingCounts = async () => {
      if (!isLoggedIn || !user) return;
      try {
        const counts = await getUserBookingCounts();
        setBookingCounts({
          active: counts.active,
          all: counts.all,
        });
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Error fetching booking counts:', error);
        }
      }
    };

    fetchBookingCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchBookingCounts, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  // Kiểm tra query param để tự động mở login modal (sau khi xác nhận email)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showLogin = searchParams.get('showLogin');
    const emailVerified = searchParams.get('emailVerified');

    if (showLogin === 'true' && !isLoggedIn) {
      // Tự động mở login modal
      setIsLoginModalVisible(true);

      // Hiển thị thông báo nếu có emailVerified
      if (emailVerified === 'success') {
        message.success('Xác thực email thành công! Vui lòng đăng nhập để tiếp tục.', 4);
      }

      // Xóa query param khỏi URL để tránh mở lại modal khi refresh
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('showLogin');
      newSearchParams.delete('emailVerified');
      const newSearch = newSearchParams.toString();
      navigate(
        {
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        },
        { replace: true }
      );
    }
  }, [location.search, location.pathname, isLoggedIn, navigate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };


  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLoginClick = () => {
    setIsLoginModalVisible(true);
    closeMenu();
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalVisible(false);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalVisible(false);
  };

  const handleSwitchToRegister = () => {
    setIsLoginModalVisible(false);
    setIsRegisterModalVisible(true);
  };
  const handleSwitchToLogin = () => {
    setIsRegisterModalVisible(false);
    setIsLoginModalVisible(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalVisible(false);
    setIsForgotPasswordModalVisible(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setIsForgotPasswordModalVisible(false);
  };

  const handleBackToLoginFromForgotPassword = () => {
    setIsForgotPasswordModalVisible(false);
    setIsLoginModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Đăng xuất thành công!');
      navigate('/');
      closeMenu();
    } catch (error) {
      message.error('Đăng xuất thất bại!');
    }
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => {
        navigate('/profile');
        closeMenu();
      }
    },
    {
      key: 'bookings',
      icon: <DashboardOutlined />,
      label: `Đơn đặt phòng${bookingCounts.active > 0 ? ` (${bookingCounts.active})` : ''}`,
      onClick: () => {
        navigate('/my-bookings');
        closeMenu();
      }
    },
    {
      key: 'vouchers',
      icon: <GiftOutlined />,
      label: 'Kho mã giảm giá',
      onClick: () => {
        navigate('/my-vouchers');
        closeMenu();
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        navigate('/settings');
        closeMenu();
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <>
      {/* Login Modal */}
      <LoginModal
        open={isLoginModalVisible}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />

      {/* Register Modal */}
      <RegisterModal
        open={isRegisterModalVisible}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={isForgotPasswordModalVisible}
        onClose={handleCloseForgotPasswordModal}
        onBackToLogin={handleBackToLoginFromForgotPassword}
      />

      {/* Menu overlay for mobile - using div with custom CSS */}
      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

      <header className={`header-area ${isScrolled ? 'is-sticky' : ''}`}>
        <div className="palatin-main-menu">
          <div className="classy-nav-container breakpoint-off">
            <div className="container">
              <nav className="classy-navbar justify-content-between" id="palatinNav">

                {/* Nav brand */}
                <Link to="/" className="nav-brand">
                  <span className="logo-text">
                    <span className="logo-book">Book</span>
                    <span className="logo-stay">Stay</span>
                  </span>
                </Link>

                {/* Navbar Toggler - Using Ant Design Button */}
                <Button
                  type="text"
                  className="classy-navbar-toggler"
                  onClick={toggleMenu}
                  icon={
                    <span className="navbarToggler">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  }
                  style={{
                    display: 'none',
                    border: 'none',
                    background: 'transparent',
                    padding: 0
                  }}
                />

                {/* Menu */}
                <div className={`classy-menu ${isMenuOpen ? 'menu-on' : ''}`}>

                  {/* Close btn - Using Ant Design Button */}
                  <Button
                    type="text"
                    className="classycloseIcon"
                    onClick={closeMenu}
                    icon={
                      <div className="cross-wrap">
                        <span className="top"></span>
                        <span className="bottom"></span>
                      </div>
                    }
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 20
                    }}
                  />

                  {/* Nav Start */}
                  <div className="classynav">
                    <ul>
                      <li className={isActive('/')}>
                        <Link to="/" onClick={closeMenu}>Trang chủ</Link>
                      </li>
                      <li className={isActive('/about')}>
                        <Link to="/about" onClick={closeMenu}>Giới thiệu</Link>
                      </li>
                      <li className={isActive('/rooms')}>
                        <Link to="/rooms" onClick={closeMenu}>Phòng</Link>
                      </li>
                      <li className={isActive('/services')}>
                        <Link to="/services" onClick={closeMenu}>Dịch vụ</Link>
                      </li>
                      <li className={isActive('/promotions')}>
                        <Link to="/promotions" onClick={closeMenu}>Khuyến mãi</Link>
                      </li>
                      <li className={isActive('/contact')}>
                        <Link to="/contact" onClick={closeMenu}>Liên hệ</Link>
                      </li>
                    </ul>

                    {/* Button or User Menu - Using Ant Design */}
                    <div className="menu-btn">
                      {isLoggedIn ? (
                        <Dropdown
                          menu={{ items: userMenuItems }}
                          placement="bottomRight"
                          trigger={['click']}
                        >
                          <div className="user-menu-avatar">
                            <Avatar
                              size={40}
                              icon={<UserOutlined />}
                              src={user?.avatar_url || user?.avatar}
                              style={{ backgroundColor: '#d89070' }}
                            />
                            <span className="user-menu-name">
                              {user?.full_name || 'User'}
                            </span>
                          </div>
                        </Dropdown>
                      ) : (
                        <Button
                          type="primary"
                          className="palatin-btn"
                          onClick={handleLoginClick}
                        >
                          Đăng Nhập
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Nav End */}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;