import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../component/Navbar";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "./Info.css"
const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const backendurl=import.meta.env.VITE_BACKEND_URL;
  


  const handlepostinfo=(e,id)=>{
    e.stopPropagation();
    navigate(`/detail/review/${id}`)
  
  }
  // Second useEffect: Fetch user data and posts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${backendurl}/upload/file/people/${id}`
        );
      
        const userInfo = response.data;

        setUser(userInfo);
      
      } catch (error) {
  console.log(error)
      }
    };

    fetchUserData();
  }, [id]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${backendurl}/upload/file/people/profile/${id}`
        );
      
        const userInfo = response.data.reverse();
        
        setUserPosts(userInfo);
      
      } catch (error) {
        console.log(error)
      }
    };

    fetchUserData();
  }, [id,navigate]);
  const handlewishlist = async (e, id) => {
    e.stopPropagation();
  
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token is found, redirect to login page
      navigate('/login');
      return;
    }
  
    try {
      // Make the API request to add the post to the wishlist using Axios
      const response = await axios.post(
        `${backendurl}/upload/file/wishlist`, // Endpoint for adding to wishlist
        { postid: id }, // Body with the postid
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Attach the token in the Authorization header
          },
        }
      );
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // The server responded with an error status code
        if (error.response.status === 400 && error.response.data.message === "Post is already in your wishlist") {
         
        } else if (error.response.status === 403) {
          // If the token is invalid or expired, redirect to login
          alert("Token is invalid or expired. Please log in again.");
          navigate("/login");
        } else {
          // For any other errors
          alert("Error adding to wishlist.");
          navigate("/login")
        }
      } else if (error.request) {
        // The request was made but no response was received
        alert("No response from the server. Please try again.");
      } else {
        // Something else caused the error
        console.error("Error:", error.message);
        alert("An error occurred. Please try again.");
      }
    }
  };
  return (
    <div className="alwaysmain">
      <Navbar/>
      <div className="userdiv">
        <div className="userprofilediv">
        {user&&(<div><img src={user.profile} alt="" className="imageprofile" /> <p className="usernameclass">{user.name}</p></div>)}
        </div>




        <div className="usercollectiondivs">
        {userPosts.length > 0 ? (userPosts &&userPosts.map((current, index) => {
              return (
                <div className="container" key={index} >
                      <FontAwesomeIcon icon={faHeart} onClick={(e) => { handlewishlist(e, current._id) }} className="heartinfo"/>
                      <img src={current.thumbnail} alt="Selected" className="thumbnailpicture" onClick={(e)=>{handlepostinfo(e,current._id)}} />
                      <p className="paragraphtitle">{current.title.length>30?current.title.slice(0,34)+"....":current.title}</p>
                </div>
              )
            })) : (<div className="nodiv"><p className="nocontent">Uff! User doesn't create Post</p></div>)}
        </div>


      </div>
    </div>
  );

};

export default ProfilePage;
