import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  return (
    <>
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
                          <li><Link to="/rooms" onClick={closeMenu}> Tất cả phòng</Link></li>
                          <li><Link to="/rooms?category=deluxe" onClick={closeMenu}>Phòng Deluxe</Link></li>
                          <li><Link to="/rooms?category=suite" onClick={closeMenu}>Phòng Suite</Link></li>
                          <li><Link to="/rooms?category=single" onClick={closeMenu}>Phòng Đơn</Link></li>
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

                    {/* Button - Using Ant Design Button */}
                    <div className="menu-btn">
                      <Button
                        type="primary"
                        className="palatin-btn"
                        onClick={closeMenu}
                      >
                        <Link to="/booking" style={{ color: 'inherit', textDecoration: 'none' }}>
                          Make a Reservation
                        </Link>
                      </Button>
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