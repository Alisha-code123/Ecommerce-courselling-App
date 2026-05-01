import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./header.css";

const Header = ({ isAuth }) => {
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <header className="nav-header">
      <div className="nav-logo">E-CourseSelling</div>

      {/* Hamburger */}
      <div className="nav-hamburger" onClick={toggleMenu}>
        {openMenu ? "✖" : "☰"}
      </div>

      {/* Navigation */}
      <nav className={`nav-links ${openMenu ? "nav-active" : ""}`}>
        <Link to="/" onClick={() => setOpenMenu(false)}>Home</Link>
        <Link to="/courses" onClick={() => setOpenMenu(false)}>Courses</Link>
        <Link to="/about" onClick={() => setOpenMenu(false)}>About</Link>

        {isAuth ? (
          <Link to="/account" onClick={() => setOpenMenu(false)}>Account</Link>
        ) : (
          <Link to="/login" onClick={() => setOpenMenu(false)}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;