import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';
import ForgotPasswordModal from '../Auth/ForgotPasswordModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import type { RoomType } from '../../types/roomtype/roomtype';
import { getUserBookingCounts } from '../../service/bookingService';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
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

  // Fetch room types for dropdown menu
  useEffect(() => {
    const fetchRoomTypes = async () => {
      setLoadingRoomTypes(true);
      try {
        const response = await api.get('/public/room-types', {
          params: { 
            status: 'active',
            per_page: 20 
          }
        });
        if (response.data.success && response.data.data) {
          setRoomTypes(response.data.data);
        } else if (Array.isArray(response.data)) {
          setRoomTypes(response.data);
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Error fetching room types:', error);
        }
        setRoomTypes([]);
      } finally {
        setLoadingRoomTypes(false);
      }
    };

    fetchRoomTypes();
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
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
                  <img src="/img/core-img/logo.png" alt="The Palatin Logo" />
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
                        <Link to="/" onClick={closeMenu}>Home</Link>
                      </li>
                      <li className={isActive('/about')}>
                        <Link to="/about" onClick={closeMenu}>About Us</Link>
                      </li>
                      <li className={`has-down ${activeDropdown === 'pages' ? 'dropdown-active' : ''}`}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleDropdown('pages');
                          }}
                        >
                          Phòng
                        </a>
                        <ul className="dropdown">
                          <li><Link to="/rooms" onClick={closeMenu}>Tất cả phòng</Link></li>
                          {roomTypes.length > 0 ? (
                            roomTypes.map((roomType) => (
                              <li key={roomType.id}>
                                <Link 
                                  to={`/rooms?room_type_id=${roomType.id}`} 
                                  onClick={closeMenu}
                                >
                                  {roomType.name}
                                </Link>
                              </li>
                            ))
                          ) : (
                            !loadingRoomTypes && (
                              <>
                                <li><Link to="/rooms?category=deluxe" onClick={closeMenu}>Phòng Deluxe</Link></li>
                                <li><Link to="/rooms?category=suite" onClick={closeMenu}>Phòng Suite</Link></li>
                                <li><Link to="/rooms?category=single" onClick={closeMenu}>Phòng Đơn</Link></li>
                              </>
                            )
                          )}
                        </ul>
                      </li>

                      <li className={isActive('/services')}>
                        <Link to="/services" onClick={closeMenu}>Services</Link>
                      </li>
                      <li className={isActive('/promotions')}>
                        <Link to="/promotions" onClick={closeMenu}>Promotions</Link>
                      </li>
                      <li className={isActive('/contact')}>
                        <Link to="/contact" onClick={closeMenu}>Contact</Link>
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