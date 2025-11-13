import './RoomsEnhanced.css';

const rooms = [
  { id: 1, image: '/img/bg-img/6.jpg', title: 'Deluxe Room', price: 150, desc: 'Spacious room with stunning sea views, private bathroom and premium amenities.' },
  { id: 2, image: '/img/bg-img/7.jpg', title: 'Double Suite', price: 150, desc: 'Elegant suite with a king bed and cozy seating area.' },
  { id: 3, image: '/img/bg-img/8.jpg', title: 'Single Room', price: 100, desc: 'Comfortable single room ideal for solo travelers seeking quiet.' },
];

export default function RoomsNew() {
  return (
    <main className="rooms-page-new">
      <section className="hero container">
        <h1 className="hero-title">Choose a room</h1>
        <p className="hero-sub">Comfort, style and great service — find the perfect room for your stay.</p>
      </section>

      <section className="booking-wrap container">
        <form className="booking-card" onSubmit={(e) => e.preventDefault()} aria-label="Search rooms">
          <input className="input" placeholder="Arrival — Departure" aria-label="Dates" />
          <select className="select" aria-label="Guests">
            <option>1 Guest</option>
            <option selected>2 Guests</option>
            <option>3 Guests</option>
          </select>
          <button className="btn primary">Check availability</button>
        </form>
      </section>

      <section className="rooms-list container">
        <h2 className="section-title">Our Rooms</h2>
        <p className="section-lead">Handpicked rooms with attention to detail — modern comforts and soothing decor.</p>

        <div className="grid">
          {rooms.map(r => (
            <article key={r.id} className="card">
              <div className="price">From ${r.price}/night</div>
              <div className="media" style={{ backgroundImage: `url(${r.image})` }} />

              <div className="card-body">
                <h3 className="card-title">{r.title}</h3>
                <p className="card-desc">{r.desc}</p>
                <div className="card-actions">
                  <button className="btn">Book Room</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
