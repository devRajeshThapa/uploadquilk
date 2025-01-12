import Navbar from "../component/Navbar";
import "./Wishlist.css"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash,faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useState,useEffect } from "react";
export default function Wishlist(){

  const[wishlistdata,setwishlistdata]=useState([]);
  const backendurl=import.meta.env.VITE_BACKEND_URL;
  

  const navigate=useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }
  
      try {
        const response = await axios.get(`${backendurl}/upload/file/wishlist`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        setwishlistdata(response.data.reverse())
      } catch (error) {
        
       
      }
    };
  
    fetchWishlist(); // Fetch wishlist on mount
  }, [navigate]);
  const handledeletepost = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }
    try {
      const response = await axios.delete(`${backendurl}/upload/file/wishlist/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      setwishlistdata(response.data.reverse())
    } catch (error) {
      
    }
  }
const handlepostinfo=(e,id)=>{
  e.stopPropagation();
  navigate(`/detail/review/${id}`)

}
const handleprofile=(e,id)=>{
  e.stopPropagation();
  navigate(`/profile/info/${id}`)
}

  return(
    <div className="alwaysmain">

<Navbar/>
<div className="wish">










  <div className="realwish">


            { Array.isArray(wishlistdata)&& wishlistdata.length > 0 ? (wishlistdata &&wishlistdata.map((current, index) => {
               if (!current.postid) {
                return (<div className="container">
                  <div className="removediv">
                      <FontAwesomeIcon icon={faXmark} className="trash" onClick={(e) => { handledeletepost(e, current._id) }} />
                    </div>
                    <p className="delteparagraph">user delete the post</p>
                   
                  </div>); 
              }
              return (
                <div className="container" key={index} >

                    <div className="removediv">
                      <FontAwesomeIcon icon={faTrash} className="trash" onClick={(e) => { handledeletepost(e, current._id) }} />
                    </div>
                    <div className="thumbnaildiv">
                      <img src={`${backendurl}/${current.postid.thumbnail}`} alt="Selected" className="thumbnail" onClick={(e)=>{handlepostinfo(e,current.postid._id)}}  />
                    </div>
                  <div className="titlediv">
                    <p className="ptitle">{current.postid.title.length>30?current.postid.title.slice(0,34)+"...":current.postid.title}</p>
                  </div>
                  <div className="creatordiv">
                  <img src={`${backendurl}/${current.postid.createdBy.profile}`} alt="Selected" className="creatorimage" onClick={(e)=>{handleprofile(e,current.postid.createdBy._id)}} />
                  <p className="creatorname" onClick={(e)=>{handleprofile(e,current.postid.createdBy._id)}}>{current.postid.createdBy.name}</p>
                  </div>

                </div>
              )
            })) : (<div className="nodiv"><p className="nocontent">Uff! Create Some wishlist</p></div>)}


      
  </div>



















</div>




    </div>
  )
}
