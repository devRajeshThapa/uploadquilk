import { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import axios from "axios";
import "./Home.css";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const backendurl=import.meta.env.VITE_BACKEND_URL;

  const [page, setPage] = useState(1);  // Track the current page
  const [loading, setLoading] = useState(false);  // Track loading state
  const navigate=useNavigate();
  const [postdata, setpostdata] = useState([]);
  const [mixdata, setmixdata] = useState([]);
  const [adsdata, setadsdata] = useState([]);

  // Function to merge the post data and ads data
  const mixArray = (array1, array2) => {
    const result = [];
    let adIndex = 0;
    
    // Shuffle ads before using them
    const shuffledAds = [...array2].sort(() => Math.random() - 0.5); // Randomly shuffle ads
    
    for (let i = 0; i < array1.length; i++) {
      result.push(array1[i]); // Push post data item
  
      // After every 2 posts, insert an ad randomly from the shuffled ads list
      if ((i + 1) % 8 === 0 && adIndex < shuffledAds.length) {
        result.push(shuffledAds[adIndex]); // Insert ad
        adIndex = (adIndex + 1) % shuffledAds.length; // Cycle through ads
      }
    }
    return result;
  };
  

  const handledetail=(e,id)=>{
    e.stopPropagation();
    navigate(`/detail/review/${id}`)
  }
 const handleprofile=(e,id)=>{
  e.stopPropagation();
  navigate(`/profile/info/${id}`)
 }


useEffect(()=>{
  const fetchads=async ()=>{
    try{
    const response=await axios.get(`${backendurl}/homeads`);
   
    setadsdata(response.data.homeads)
    }catch(error){
      
    }
  }
  fetchads();
},[navigate])
useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    
    // Set the limit based on the current page
    const limit = page === 1 ? 25 : 5; // Fetch 15 on the first page, 5 on subsequent pages

    try {
      const response = await axios.get(
        `${backendurl}/upload/file/home?page=${page}&limit=${limit}`
      );
      const newPosts = response.data.datas;
     
      if (newPosts.length > 0) {
        setpostdata((prevData) => [...prevData, ...newPosts]);  // Append new posts to existing ones
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [page,navigate]);  // Fetch posts when the page changes

  // Once postdata is updated, merge it with adsdata and update mixdata
  useEffect(() => {
    if (postdata.length > 0 && adsdata.length>0) {
      const mixedData = mixArray(postdata, adsdata);
      setmixdata(mixedData);  // Update mixdata with merged data
    }
  }, [postdata,adsdata]);  // Run this effect when postdata changes

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading) {
      setPage((prevPage) => prevPage + 1);  // Increment page number when scrolled to the bottom
    }
  };
  

  return (
    <div className="alwaysmain">
      <Navbar />
     
      <div className="postcontainer" onScroll={handleScroll}>
        {postdata.length > 0 && mixdata.length > 0 ? (
          mixdata.map((current, index) => {
            return (index + 1) % 9 === 0 ? (
                <div className="contentdivsponsored" key={index}>
                  
                    <div className="shows">
                   
                    {current.imgsrc && (
  current.imgsrc.match(/\.(mp4|webm|ogv)$/i) ? (
    <a href={current.links} target="_blanks">
       <video
      src={current.imgsrc}
      alt="Selected"
      className="showimage"
      loop
      muted
      autoPlay
    />
    </a>
   
  ) : (
    <a href={current.links} target="_blanks">
        <img
      src={current.imgsrc}
      className="showimage"
      alt="Selected"
    />
    </a>
  
  )
)}

                   
                  </div>
                
                  <div className="title">
                    <p className="currenttitle">{current.title}</p>
                  </div>
                  <div className="creatordiv">
                <a href={current.links} target="_blanks">
                <img
                    src={current.profileimage}
                    alt="Selected"
                    className="userimage"
                  />
                  </a> 
                  <p className="usernames">Sponsered</p>
                  <a href={current.links} target="_blank" ><button className="showlink">Visit</button></a>
                </div>
            
              </div>
            ) : (
              <div className="container" key={index} >
              <div className="thumbnaildiv">
                <img src={current.thumbnail} alt="Selected" className="thumbnail" onClick={(e)=>{handledetail(e,current._id)}} />
              </div>
            <div className="titlediv">
              <p className="ptitle">{current.title.length>30?current.title.slice(0,34)+"...":current.title}</p>
            </div>
            <div className="creatordiv">
            <img src={current.createdBy.profile} alt="Selected" className="creatorimage" onClick={(e)=>{handleprofile(e,current.createdBy._id)}} />
            <p className="creatorname" onClick={(e)=>{handleprofile(e,current.createdBy._id)}}>{current.createdBy.name}</p>
            </div>

          </div>
            );
          })
        ) : (
          <div className="nodiv">
            <p className="nocontent">Uff! No Content</p>
          </div>
        )}
      </div>
    </div>
  );
}
