import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

  return (
    <div className="home-container-hero" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
      <div className="overlay"></div>
      <div className="content-container">
        <div className="header-text">
          <h1>Welcome to CelebrateHub</h1>
          <p>Your ultimate destination for planning and booking services for any event. Let's make your celebration unforgettable.</p>
        </div>
        <Link to="/new-booking" className="cta-button">
          Plan Your Event
        </Link>
      </div>
    </div>
  );
};

export default Home;
