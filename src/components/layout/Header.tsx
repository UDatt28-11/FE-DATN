import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Button, Drawer, Layout } from 'antd';
import { MenuOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/about',
      label: <Link to="/about">About Us</Link>,
    },
    {
      key: 'pages',
      label: 'Pages',
      icon: <DownOutlined style={{ fontSize: '10px' }} />,
      children: [
        {
          key: '/rooms',
          label: <Link to="/rooms">Rooms</Link>,
        },
        {
          key: '/blog',
          label: <Link to="/blog">Blog</Link>,
        },
        {
          key: '/gallery',
          label: <Link to="/gallery">Gallery</Link>,
        },
      ],
    },
    {
      key: 'mega',
      label: 'Mega Menu',
      icon: <DownOutlined style={{ fontSize: '10px' }} />,
      children: [
        {
          type: 'group',
          label: 'Room & Suites',
          children: [
            { key: '/rooms/single', label: <Link to="/rooms/single">Single Room</Link> },
            { key: '/rooms/double', label: <Link to="/rooms/double">Double Room</Link> },
            { key: '/rooms/suite', label: <Link to="/rooms/suite">Deluxe Suite</Link> },
          ],
        },
        {
          type: 'group',
          label: 'Facilities',
          children: [
            { key: '/facilities/restaurant', label: <Link to="/facilities/restaurant">Restaurant</Link> },
            { key: '/facilities/gym', label: <Link to="/facilities/gym">Gym</Link> },
            { key: '/facilities/spa', label: <Link to="/facilities/spa">Spa</Link> },
          ],
        },
      ],
    },
    {
      key: '/services',
      label: <Link to="/services">Services</Link>,
    },
    {
      key: '/contact',
      label: <Link to="/contact">Contact</Link>,
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'fixed',
        width: '100%',
        zIndex: 999,
        backgroundColor: isScrolled ? '#000000' : 'rgba(0, 0, 0, 0.9)',
        padding: isScrolled ? '10px 50px' : '20px 50px',
        transition: 'all 0.3s ease-in-out',
        boxShadow: isScrolled ? '0 2px 10px rgba(0, 0, 0, 0.2)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
            <span style={{ fontSize: '28px', color: '#cb8670', marginRight: '10px' }}>◈</span>
            <span style={{ fontSize: '24px', fontWeight: 500 }}>The Palatin</span>
          </div>
        </Link>
      </div>

      {!isMobile ? (
        <>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              flex: 1,
              justifyContent: 'center',
              color: '#fff',
            }}
            theme="dark"
          />
          <Button
            type="primary"
            style={{
              backgroundColor: '#cb8670',
              borderColor: '#cb8670',
              height: '44px',
              padding: '0 28px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
            }}
          >
            <Link to="/booking" style={{ color: '#fff', textDecoration: 'none' }}>
              Make A Reservation
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            onClick={toggleMenu}
          />
          <Drawer
            title={
              <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontSize: '28px', color: '#cb8670', marginRight: '10px' }}>◈</span>
                <span style={{ fontSize: '20px', fontWeight: 500 }}>The Palatin</span>
              </div>
            }
            placement="right"
            onClose={() => setIsMenuOpen(false)}
            open={isMenuOpen}
            styles={{
              body: { padding: 0 },
              header: { backgroundColor: '#000', borderBottom: '1px solid #333' },
            }}
            width={300}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ backgroundColor: '#000', border: 'none' }}
              theme="dark"
              onClick={() => setIsMenuOpen(false)}
            />
            <div style={{ padding: '20px' }}>
              <Button
                type="primary"
                block
                style={{
                  backgroundColor: '#cb8670',
                  borderColor: '#cb8670',
                  height: '44px',
                }}
              >
                <Link to="/booking" style={{ color: '#fff', textDecoration: 'none' }}>
                  Make A Reservation
                </Link>
              </Button>
            </div>
          </Drawer>
        </>
      )}
    </AntHeader>
  );
};

export default Header;