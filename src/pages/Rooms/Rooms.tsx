import React, { useEffect } from 'react';
import './Rooms.css';

const Rooms: React.FC = () => {
  const rooms = [
    { id: 1, image: '/img/bg-img/1.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 2, image: '/img/bg-img/8.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 3, image: '/img/bg-img/9.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
    { id: 4, image: '/img/bg-img/15.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 5, image: '/img/bg-img/16.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 6, image: '/img/bg-img/17.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
    { id: 7, image: '/img/bg-img/18.jpg', title: 'Deluxe Room', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '100ms' },
    { id: 8, image: '/img/bg-img/19.jpg', title: 'Double Suite', price: 150, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '200ms' },
    { id: 9, image: '/img/bg-img/20.jpg', title: 'Single Room', price: 100, desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque.', delay: '300ms' },
  ];

  useEffect(() => {
    // Trigger animations on mount
    const elements = document.querySelectorAll('.wow');
    elements.forEach((el) => {
      el.classList.add('fadeInUp');
    });
  }, []);

  return (
    <div className="rooms-page">
      {/* Breadcrumb Area */}
      <section className="breadcumb-area bg-img d-flex align-items-center justify-content-center" style={{ backgroundImage: 'url(/img/bg-img/bg-6.jpg)' }}>
        <div className="bradcumbContent">
          <h2>Rooms</h2>
        </div>
      </section>

      {/* Book Now Area */}
      <div className="book-now-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="book-now-form">
                <form action="#">
                  {/* Check In */}
                  <div className="form-group">
                    <label htmlFor="select1">Check In</label>
                    <select className="form-control" id="select1">
                      <option>19 June</option>
                      <option>20 June</option>
                      <option>21 June</option>
                      <option>22 June</option>
                      <option>23 June</option>
                      <option>24 June</option>
                      <option>25 June</option>
                    </select>
                  </div>

                  {/* Check Out */}
                  <div className="form-group">
                    <label htmlFor="select2">Check Out</label>
                    <select className="form-control" id="select2">
                      <option>20 June</option>
                      <option>21 June</option>
                      <option>22 June</option>
                      <option>23 June</option>
                      <option>24 June</option>
                      <option>25 June</option>
                      <option>26 June</option>
                      <option>27 June</option>
                    </select>
                  </div>

                  {/* Adults */}
                  <div className="form-group">
                    <label htmlFor="select3">Adults</label>
                    <select className="form-control" id="select3">
                      <option>02</option>
                      <option>03</option>
                      <option>04</option>
                      <option>05</option>
                      <option>06</option>
                    </select>
                  </div>

                  {/* Childrens */}
                  <div className="form-group">
                    <label htmlFor="select4">Childrens</label>
                    <select className="form-control" id="select4">
                      <option>01</option>
                      <option>02</option>
                      <option>03</option>
                      <option>04</option>
                      <option>05</option>
                    </select>
                  </div>

                  {/* Button */}
                  <button type="submit">Book Now</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Area */}
      <section className="rooms-area section-padding-0-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-6">
              <div className="section-heading text-center">
                <div className="line-"></div>
                <h2>Choose a room</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque, at rutrum nulla dictum. Ut ac ligula sapien.</p>
              </div>
            </div>
          </div>

          <div className="row">
            {rooms.map((room) => (
              <div className="col-12 col-md-6 col-lg-4" key={room.id}>
                <div className="single-rooms-area wow fadeInUp" data-wow-delay={room.delay} style={{ animationDelay: room.delay }}>
                  {/* Thumbnail */}
                  <div className="bg-thumbnail bg-img" style={{ backgroundImage: `url(${room.image})` }}></div>
                  {/* Price */}
                  <p className="price-from">From ${room.price}/night</p>
                  {/* Rooms Text */}
                  <div className="rooms-text">
                    <div className="line"></div>
                    <h4>{room.title}</h4>
                    <p>{room.desc}</p>
                  </div>
                  {/* Book Room Button */}
                  <a href="#" className="book-room-btn btn palatin-btn">Book Room</a>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="col-12">
              <div className="pagination-area wow fadeInUp" data-wow-delay="400ms" style={{ animationDelay: '400ms' }}>
                <nav>
                  <ul className="pagination">
                    <li className="page-item active"><a className="page-link" href="#">01.</a></li>
                    <li className="page-item"><a className="page-link" href="#">02.</a></li>
                    <li className="page-item"><a className="page-link" href="#">03.</a></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;