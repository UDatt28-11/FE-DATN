import { useEffect } from 'react';

export const useHeaderScroll = () => {
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('header-sticky');
        } else {
          header.classList.remove('header-sticky');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

export const useMobileMenu = () => {
  useEffect(() => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    const handleMenuToggle = () => {
      if (mobileMenu) {
        mobileMenu.classList.toggle('active');
      }
    };

    menuToggle?.addEventListener('click', handleMenuToggle);
    return () => menuToggle?.removeEventListener('click', handleMenuToggle);
  }, []);
};