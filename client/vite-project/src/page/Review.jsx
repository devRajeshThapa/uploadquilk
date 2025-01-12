import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import { useEffect, useState } from "react";
import "./Review.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
export default function Review() {
  const { id } = useParams();
  const [infodata, setInfodata] = useState(null);
  const [mixdata, setMixdata] = useState([]);
  const [selectedimage, setselectedimage] = useState(null);
  const [adsdata, setadsdata] = useState([]);
  const backendurl=import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  // Function to merge post data and ads data
  const mixArray = (array1, array2) => {
    
    const result = [];
    let adIndex = 0;
    
    // Shuffle ads before using them
    const shuffledAds = [...array2].sort(() => Math.random() - 0.5); // Randomly shuffle ads
    
    for (let i = 0; i < array1.length; i++) {
      result.push(array1[i]); // Push post data item
  
      // After every 2 posts, insert an ad randomly from the shuffled ads list
      if ((i + 1) % 21 === 0 && adIndex < shuffledAds.length) {
        result.push(shuffledAds[adIndex]); // Insert ad
        adIndex = (adIndex + 1) % shuffledAds.length; // Cycle through ads
      }
    }
    return result;
  };
  
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${backendurl}/upload/file/${id}`);
        
        setInfodata(response.data.postdata);
      } catch (error) {
        navigate("/");
      }
    };

    fetchPosts();
  }, [id, navigate]);
  useEffect(()=>{
    const fetchads=async ()=>{
      try{
      const response=await axios.get(`${backendurl}/otherads`);
      
      setadsdata(response.data.otherads)
      }catch(error){
        
      }
    }
    fetchads();
  },[navigate])
 const handleprofile=(e,id)=>{
       navigate(`/profile/info/${id}`)
 }
 

  useEffect(() => {
    if (infodata&&adsdata.length>0) {
      const mixedData = mixArray(infodata.images, adsdata);

      setselectedimage(mixedData[0]);
      setMixdata(mixedData)
    }
  }, [infodata, adsdata]);
  const handleselectedimage = (e, current) => {
    setselectedimage(current)
  }
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
      <Navbar />

      <div className="detail">

        <div className="detaildiv">
          <div className="bigimagediv" onClick={(e)=>{handlewishlist(e,id)}}>
            <div className="pen">
              <FontAwesomeIcon icon={faHeart} className="penicon" />
            </div>
            {selectedimage &&
              (typeof selectedimage === "object" && selectedimage.imgsrc ? (
                <>
                 {selectedimage.imgsrc && (
  selectedimage.imgsrc.match(/\.(png|jpe?g|gif|bmp)$/i) ? (
    <a href={selectedimage.links} target="_blank" rel="noreferrer">
      <img src={selectedimage.imgsrc} alt="Ad" className="bigimagepic" />
    </a>
  ) : selectedimage.imgsrc.match(/\.(mp4|webm|ogv)$/i) ? (
    <a href={selectedimage.links} target="_blank" rel="noreferrer">
      <video controls  autoPlay loop src={selectedimage.imgsrc} className="bigimagepic"></video>
    </a>
  ) : null 
)}

                </>
              ) : (
                <>
                {selectedimage && (
  selectedimage.match(/\.(png|jpe?g|gif|bmp|tiff|webp)$/i) ? (
    <img 
      src={`${backendurl}/${selectedimage}`} 
      alt="Post" 
      className="bigimagepic" 
    />
  ) : selectedimage.match(/\.(mp4|webm|ogv)$/i) ? (
    <video 
      src={`${backendurl}/${selectedimage}`} 
      controls 
      muted 
      autoPlay 
      className="bigimagepic" 
    />
  ) : selectedimage.endsWith(".pdf") ? (
    <iframe 
      src={`https://docs.google.com/viewer?url=${backendurl}/${selectedimage}&embedded=true`} 
      className="bigimagepic" 
    ></iframe>
  ) : null 
)}

                </>
              ))}
          </div>
          <div className="titlesdiv">
            {infodata && <p className="titles">{infodata.title}</p>}
          </div>
          <div className="imagedivreview" style={{justifyContent:mixdata.length>5?"flex-start":"center"}}>
            {mixdata.length > 0 &&
              mixdata.map((current, index) => {
               
                if (current.imgsrc) {
                  // Handle images
                  if (current.imgsrc.match(/\.(png|jpe?g|gif|bmp|tiff|webp)$/i)) {
                    return (
                      <img
                        src={current.imgsrc}
                        alt="Ad"
                        className="imageprev"
                        onClick={(e) => { handleselectedimage(e, current); }}
                      />
                    );
                  }
                  // Handle videos
                  else if (current.imgsrc.match(/\.(mp4|webm|ogv)$/i)) {
                    return (
                      <video
                        src={current.imgsrc}
                        autoPlay
                        muted
                        loop
                        className="imageprev"
                        onClick={(e) => { handleselectedimage(e, current); }}
                      ></video>
                    );
                  }
                }
                 else {
                  // Handle media items from infodata.images
                  if(current.match(/\.(png|jpe?g|gif|bmp|tiff|webp)$/i)) {
                    return (
                      <img
                        key={index}
                        src={`${backendurl}/${current}`}
                        alt="Image"
                        className="imageprevdata"
                        onClick={(e) => { handleselectedimage(e, current) }}
                      />
                    );
                  } else if  (current.match(/\.(mp4|webm|ogv)$/i)) {
                    return (
                      <video key={index} autoPlay muted loop className="imageprevdata" onClick={(e) => { handleselectedimage(e, current) }}>
                        <source src={`${backendurl}/${current}`} />
                      </video>
                    );
                  } else if (current.endsWith(".pdf")) {
                    return (
                      <button className="showbutton" onClick={e => { handleselectedimage(e, current) }}>Show Pdf</button>
                    );
                  }
                }
                return null;
              })}
          </div>
          <div className="profiledivcontainer" >
            {infodata && <><img src={`${backend}/${infodata.createdBy.profile}`} alt="" className="profilepicture" onClick={(e)=>{handleprofile(e,infodata.createdBy._id)}} /> <p className="profilename">{infodata.createdBy.name}</p></>}
          </div>
          <div className="descriptiondiv">
            {infodata && <div> <p className="descriptiontext">*Description: {infodata.description} * if anyone have any copyright issues contact: thequilk369@gmail.com</p> </div>}
          </div>
        </div>
       
      </div>

    </div>
  );
}
