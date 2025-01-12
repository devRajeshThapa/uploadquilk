import Navbar from "../component/Navbar";
import "./News.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft,faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { useState,useEffect } from "react"
import { useNavigate ,useParams} from "react-router-dom"
import axios from "axios"
export default function Newsinfo(){
  const navigate=useNavigate();
  const [postdata, setpostdata] = useState([]);
  const[updateddata,setupdateddata]=useState([]);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);  // Track the current page
  const [loading, setLoading] = useState(false);  // Track loading state  
   const { id } = useParams();
   const backendurl=import.meta.env.VITE_BACKEND_URL;
     const [adsdata, setadsdata] = useState([]);
      const mixArray = (array1, array2) => {
       const result = [];
       let number = 0;
       for (let item = 0; item < array1.length; item++) {
         result.push(array1[item]);  // Push the post data item
         if ((item + 1) % 10 === 0 && number < array2.length) {
           result.push(array2[number]);  // Insert ads data after every 4th item
           number = (number + 1) % array2.length;
         }
       }
       return result;
     };
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
     // Modify your main component to track the current image index locally for each post
const [imageIndexes, setImageIndexes] = useState({});

const handleNextImage = (e, postId, imagesLength) => {
  e.stopPropagation(); // Prevent any unwanted bubbling
  setImageIndexes((prevIndexes) => ({
    ...prevIndexes,
    [postId]: (prevIndexes[postId] + 1 || 1) % imagesLength,
  }));
};

const handlePrevImage = (e, postId, imagesLength) => {
  e.stopPropagation(); // Prevent any unwanted bubbling
  setImageIndexes((prevIndexes) => ({
    ...prevIndexes,
    [postId]: (prevIndexes[postId] - 1 + imagesLength) % imagesLength,
  }));
};

     useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${backendurl}/upload/file/people/${id}`
          );
        
          const userInfo = response.data;
  
          setUser(userInfo);
        
        } catch (error) {
    navigate("/")
        }
      };
  
      fetchUserData();
    }, [id,navigate]);
    useEffect(() => {
      const fetchUserData = async () => {
        setLoading(true);
        
        const limit = page === 1 ? 12 : 3;  // Fetch 9 on first page, 3 on subsequent pages
        try {
          const response = await axios.get(
            `${backendurl}/upload/file/people/profile/news/${id}?page=${page}&limit=${limit}`
          );
        
          const userInfo = response.data;
          if (userInfo.length > 0) {
            setpostdata((prevData) => [...userInfo,...prevData]);  // Append new posts to existing ones
          }
        
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false); // Stop loading when done
        }
      };
    
      fetchUserData();
    }, [id, page,navigate]);
    
  useEffect(()=>{
    if(postdata.length>0&&adsdata.length>0){
      const report=postdata.map((current,index)=>{
        const copyimages=[...current.images];
        const updatesimages=mixArray(copyimages,adsdata);
        return({...current,images:updatesimages})
      })
     
      setupdateddata(report.reverse())
    }
    },[postdata,adsdata])
    const handleScroll = (e) => {
      const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
      if (bottom && !loading) {
        setPage((prevPage) => prevPage + 1);  // Increment page number when scrolled to the bottom
      }
    };
    
  return(
    <div className="alwaysmain" >
    <Navbar/>
    <div className="newscontainer" onScroll={handleScroll}>
       <div className="userprofilediv">
        {user&&(<div><img src={`${backendurl}/${user.profile}`} alt="" className="imageprofile" /> <p className="usernameclass">{user.name}</p></div>)}
        </div>
         
            {updateddata.length>0?(<div className="actualnews">
             {updateddata.map((current,index)=>{
              const currentIndex = imageIndexes[current._id] || 0;
             return(
              <div className="container" key={index}>
                <div className="imageandcreated">
                  <div className="imageprofilediv">
                      <img src={`${backendurl}/${current.createdBy.profile}`} alt="" className="imageprofile"/>
                  </div>
                  <div className="createtitle">
                           <p className="titlething">{current.title}---{current.createdBy.name}</p>
                  </div>
                </div>
               <div className="postingimage">
                <FontAwesomeIcon icon={faChevronLeft} className="arrowleft"  onClick={(e) => handlePrevImage(e, current._id, current.images.length)}/>
                {typeof current.images[currentIndex] === "object" ? (
              current.images[currentIndex].imgsrc ? (
                current.images[currentIndex].imgsrc.endsWith(".png") ||
                current.images[currentIndex].imgsrc.endsWith(".jpg") ||
                current.images[currentIndex].imgsrc.endsWith(".jpeg") ||
                current.images[currentIndex].imgsrc.endsWith(".gif") ||
                current.images[currentIndex].imgsrc.endsWith(".bmp") ||
                current.images[currentIndex].imgsrc.endsWith(".webp") ? (
                  // Image rendering
                  <a href={`${current.images[currentIndex].links}`} target="_blanks" className="imagesshown">
                    <img
                    src={current.images[currentIndex].imgsrc}
                    alt="Image with Link"
                    className="imagesshown"
                  />
                  </a>
                  
                ) : current.images[currentIndex].imgsrc.endsWith(".mp4") ||
                current.images[currentIndex].imgsrc.endsWith(".webm") ||
                current.images[currentIndex].imgsrc.endsWith(".ogg") ||
                current.images[currentIndex].imgsrc.endsWith(".avi") ||
                current.images[currentIndex].imgsrc.endsWith(".mov") ||
                current.images[currentIndex].imgsrc.endsWith(".flv") ? (
                  // Video rendering
                  <a href={`${current.images[currentIndex].links}`} target="_blanks">
                    <video
                    controls
                    muted
                    autoPlay
                    className="imagesshown"
                    src={current.images[currentIndex].imgsrc}
                  ></video>
                  </a>
                  
                ) : null
              ) : null
            ) : (
              <>
                { current.images[currentIndex].endsWith(".png") ||
                current.images[currentIndex].endsWith(".jpg") ||
                current.images[currentIndex].endsWith(".jpeg") ||
                current.images[currentIndex].endsWith(".gif") ||
                current.images[currentIndex].endsWith(".bmp") ||
                current.images[currentIndex].endsWith(".webp")  ? (
                  // Image rendering
                  <img
                    src={`${backendurl}/${current.images[currentIndex]}`}
                    alt="Image"
                    className="imagesshown"
                  />
                ) : current.images[currentIndex].endsWith(".mp4") ||
                current.images[currentIndex].endsWith(".webm") ||
                current.images[currentIndex].endsWith(".ogg") ||
                current.images[currentIndex].endsWith(".avi") ||
                current.images[currentIndex].endsWith(".mov") ||
                current.images[currentIndex].endsWith(".flv") ? (
                  // Video rendering
                  <video
                    controls
                    className="imagesshown"
                    src={`${backendurl}/${current.images[currentIndex]}`}
                  ></video>
                ) : current.images[currentIndex].endsWith(".pdf") ? (
                  // PDF rendering as link
                  <iframe src={`https://docs.google.com/viewer?url=${backendurl}/${current.images[currentIndex]}&embedded=true`}  frameborder="0" className="imagesshown"></iframe>
                ) : null}
              </>
            )}
               <FontAwesomeIcon icon={faChevronRight} className="arrowright"onClick={(e) => handleNextImage(e, current._id, current.images.length)}/>
               </div>
              </div>
             )
             })}
            </div>):(<div className="nothingshow">User doesn't create News</div>)}
          </div>
    </div>
  )
}
