import React from 'react';
import './BookRoomButton.css';

interface BookRoomButtonProps {
  onClick?: () => void;
  className?: string;
}

const BookRoomButton: React.FC<BookRoomButtonProps> = ({ onClick, className = '' }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <a 
      href="#" 
      className={`book-room-btn btn palatin-btn ${className}`}
      onClick={handleClick}
    >
      Book Room
    </a>
  );
};

export default BookRoomButton;
