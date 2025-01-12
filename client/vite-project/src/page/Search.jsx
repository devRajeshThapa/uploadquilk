import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../component/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
export default function Search() {
  const [searchparams, setsearchparams] = useSearchParams();
  const navigate = useNavigate();
  const [searchdata, setsearchdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const backendurl=import.meta.env.VITE_BACKEND_URL;
  const [page, setPage] = useState(1);  // Track the current page
  const [loading, setLoading] = useState(false);  // Track loading state
  const[newmixdata,setnewmixdata]=useState([]);
  const [postdata, setpostdata] = useState([]);
  const [mixdata, setmixdata] = useState([]);
    const [adsdata, setadsdata] = useState([]);
  const data = searchparams.get("query");
  const mixArray = (array1, array2) => {
    const result = [];
    let number = 0;
    for (let item = 0; item < array1.length; item++) {
      result.push(array1[item]);  // Push the post data item
      if ((item + 1) % 8 === 0 && number < array2.length) {
        result.push(array2[number]);  // Insert ads data after every 4th item
        number = (number + 1) % array2.length;
      }
    }
    return result;
  };
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
    if (postdata.length > 0 && adsdata.length>0) {
      const mixedData = mixArray(postdata, adsdata);
     
      setmixdata(mixedData);  
    }
  }, [postdata,adsdata]); 
  useEffect(()=>{
    if(filteredData.length>0){
      const mixedData=mixArray(filteredData,adsdata);
    
      setnewmixdata(mixedData)
    }
  },[filteredData])
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      // Set the limit based on the current page
      const limit = page === 1 ? 25 : 5; // Fetch 15 on the first page, 5 on subsequent pages
  
      try {
        const response = await axios.get(
          `${backendurl}/upload/file/home?page=${page}&limit=${limit}`
        );
        const newPosts = response.data.datas.reverse();
        
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
  }, [page,navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${backendurl}/upload/file`);
        const reversedResponse = response.data.datas.reverse(); // Reverse the posts order
        setsearchdata(reversedResponse);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [navigate]); 

  useEffect(() => {
  
    if (searchdata.length > 0) {
      // Filter the data based on the query parameter
      const filtersearchdata = searchdata.filter((current) =>
        current.title.toLowerCase().includes(data?.toLowerCase())
      );
      setFilteredData(filtersearchdata); // Update the filtered data state
    }
  }, [searchdata, data]); // Re-run this effect whenever searchdata or the query parameter changes
    const handledetail=(e,id)=>{
      e.stopPropagation();
      navigate(`/detail/review/${id}`)
    }
  
 const handleprofile=(e,id)=>{
  e.stopPropagation();
  navigate(`/profile/info/${id}`)
 }
 

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
      {filteredData.length > 0 ? (
    newmixdata.length>0 && newmixdata.map((current, index) => {
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
            <img src={`${backendurl}/${current.thumbnail}`} alt="Selected" className="thumbnail" onClick={(e)=>{handledetail(e,current._id)}} />
          </div>
        <div className="titlediv">
          <p className="ptitle">{current.title.length>30?current.title.slice(0,34)+"...":current.title}</p>
        </div>
        <div className="creatordiv">
        <img src={`${backendurl}/${current.createdBy.profile}`} alt="Selected" className="creatorimage" onClick={(e)=>{handleprofile(e,current.createdBy._id)}} />
        <p className="creatorname" onClick={(e)=>{handleprofile(e,current.createdBy._id)}}>{current.createdBy.name}</p>
        </div>

      </div>
        );
      })
      ) : (
      mixdata.length>0  && mixdata.map((current, index) => {
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
            <img src={`${backendurl}/${current.thumbnail}`} alt="Selected" className="thumbnail" onClick={(e)=>{handledetail(e,current._id)}} />
          </div>
        <div className="titlediv">
          <p className="ptitle">{current.title.length>30?current.title.slice(0,34)+"....":current.title}</p>
        </div>
        <div className="creatordiv">
        <img src={`${backendurl}/${current.createdBy.profile}`} alt="Selected" className="creatorimage" onClick={(e)=>{handleprofile(e,current.createdBy._id)}} />
        <p className="creatorname" onClick={(e)=>{handleprofile(e,current.createdBy._id)}}>{current.createdBy.name}</p>
        </div>

      </div>
        );
      })
        
      )}
      </div>
    </div>
  );
}
