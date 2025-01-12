import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faHeart, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import newslogo from "../assets/newslogo.png";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { useState } from 'react';

export default function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false); // Track if search is clicked
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchValue.length > 0) {
      navigate(`/search?query=${searchValue}`);
      setSearchValue("");
    }
  };

  const handleSearchClick = () => {
    if (searchValue.length > 0) {
      navigate(`/search?query=${searchValue}`);
      setSearchValue("");
    }
  };

  const handleSearchIconClick = () => {
    setSearchClicked(true); // Show search input and hide other icons
  };

  const handleHomeLogoClick = () => {
    setSearchClicked(false); // Hide search input and show other icons
  };

  return (
    <div className="navbar">
      <div className="start">
        {/* Home Logo */}
        <Link 
          to="/" 
          className={`link ${searchClicked ? 'show' : ''}`} 
          onClick={handleHomeLogoClick}  // Add handler for Home logo click
        >
          <img src={logo} alt="Home Logo" className="image" />
        </Link>

        {/* Wishlist Heart Icon */}
        <Link to="/wishlist" className={`link ${searchClicked ? 'hide' : ''}`}>
          <FontAwesomeIcon icon={faHeart} className="heart" />
        </Link>
      </div>

      <div className="middle">
        {/* News Logo */}
        <Link to="/news" className={`link ${searchClicked ? 'hide' : ''}`}>
          <div className="newsdiv">
            <img src={newslogo} alt="News" className="newimage" />
          </div>
        </Link>

        {/* Search Input */}
        <input
          type="text"
          className={`input ${searchClicked ? 'show-input' : ''}`}
          placeholder="Search here..."
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        {/* Search Icon */}
        <div
          className={`searchdiv ${searchClicked ? 'show' : ''}`}
          onClick={handleSearchIconClick}
        >
          <FontAwesomeIcon icon={faSearch} className="search" onClick={handleSearchClick}/>
        </div>
      </div>

      <div className="end">
        {/* People Icon */}
        <Link to="/people" className={`link ${searchClicked ? 'hide' : ''}`}>
          <FontAwesomeIcon icon={faUsers} className="users" />
        </Link>

        {/* Profile Icon */}
        <Link to="/profile" className={`link ${searchClicked ? 'hide' : ''}`}>
          <FontAwesomeIcon icon={faUser} className="user" />
        </Link>
      </div>
    </div>
  );
}
