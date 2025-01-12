import Navbar from "../component/Navbar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd, faPlus, faTrash, faX ,faArrowLeft,faArrowRight} from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import "./News.css"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
export default function News(){
 const[newspost,setnewspost]=useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [image, setimage] = useState([]);
 const [selectedImage, setSelectedImage] = useState(null);
 const [title, settitle] = useState("");
 const [userid, setuserid] = useState();
 const[filterdata,setfilterdata]=useState([]);
 const[chunkdata,setchunkdata]=useState([]);
 const[realchunkdata,setrealchunkdata]=useState([])
 const [page, setPage] = useState(1);  // Track the current page
 const [loading, setLoading] = useState(false);  // Track loading state
 const [postdata, setpostdata] = useState([]);
 const[updateddata,setupdateddata]=useState([]);
 const[actualupdate,setactualupdate]=useState([]);
 const backendurl=import.meta.env.VITE_BACKEND_URL
  const [adsdata, setadsdata] =useState([]);
  useEffect(()=>{
    const fetchads=async ()=>{
      try{
      const response=await axios.get(`${backendurl}/otherads`);
    
      setadsdata(response.data.otherads)
      }catch(error){
        
      }
    }
    fetchads();
  },[])
   const mixArray = (array1, array2) => {
    const result = [];
    let number = 0;
    for (let item = 0; item < array1.length; item++) {
      result.push(array1[item]);  // Push the post data item
      if ((item + 1) % 3 === 0 && number < array2.length) {
        result.push(array2[number]);  // Insert ads data after every 4th item
        number = (number + 1) % array2.length;
      }
    }
    return result;
  };
 const navigate=useNavigate();
 const handleadds=(e)=>{
  setnewspost(true)
 }
 const handleSearch = (e) => {
  setSearchQuery(e.target.value);
};
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
 const handleadd=(e)=>{
  setnewspost(false)
  setimage([])
  setSelectedImage(null)
  settitle("")
 }
 const handleImageClick = (image) => {
  setSelectedImage(image);
};
useEffect(() => {
    
  const checkTokenAndFetchData = async () => {
    const token = localStorage.getItem("token"); 
    if (!token) {
      // If no token, redirect to login page
      navigate("/login");
      return;
    }

    try {
      // Send the token to backend for validation
      const response = await axios.post(
        `${backendurl}/upload/file/verifytoken`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );
      setuserid(response.data.userId);
    } catch (error) {
      localStorage.removeItem("token")
      navigate("/login");
    }
  };

  checkTokenAndFetchData();
}, []);
useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    
    // Set the limit based on the current page
    const limit = page === 1 ? 12 : 3; // Fetch 15 on the first page, 5 on subsequent pages

    try {
      const response = await axios.get(
        `${backendurl}/upload/file/news/bit?page=${page}&limit=${limit}`
      );
      const newPosts = response.data.datas;
     
      if (newPosts.length > 0) {
        setchunkdata((prevData) => [...prevData,...newPosts]);  // Append new posts to existing ones
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [page]); 
const handleScroll = (e) => {
  const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
  if (bottom && !loading) {
    setPage((prevPage) => prevPage + 1);  // Increment page number when scrolled to the bottom
  }
}
useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${backendurl}/upload/file/news`);
      const dataset = response.data.datas;
      setpostdata(dataset.reverse()); 
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  fetchPosts();
}, [navigate]);
useEffect(
  ()=>{
if(postdata.length>0&&userid){


const filterdata=postdata.filter(current=>current.createdBy._id===userid);

setfilterdata(filterdata)
}
  },[postdata,userid] )
useEffect(()=>{
if(postdata.length>0 &&adsdata.length>0){
  const report=postdata.map((current,index)=>{
    const copyimages=[...current.images];
    const updatesimages=mixArray(copyimages,adsdata);
  
    return({...current,images:updatesimages})
  })
  
  setupdateddata(report)
}
},[postdata,adsdata])
useEffect(()=>{
  if(chunkdata.length>0 &&adsdata.length>0){
    const report=chunkdata.map((current,index)=>{
      const copyimages=[...current.images];
      const updatesimages=mixArray(copyimages,adsdata);
    
      return({...current,images:updatesimages})
    })
    
    setrealchunkdata(report)
  }
  },[chunkdata,adsdata])
const handletitle = (e) => {
  const newtitle = e.target.value;
  if (newtitle.length <= 90) {
    settitle(newtitle);
  }
};
const handlenewsinfo=(e,id)=>{
  navigate(`/profile/news/${id}`)
}
const handlefilechange = (e) => {
  const file = e.target.files[0];

  // Check if file type is valid
  if (file && (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf")) {
    const newTotalSize = image.reduce((acc, currentImage) => acc + currentImage.file.size, 0) + file.size;

    const MAX_SIZE = 10 * 1024 * 1024;  // 10 MB in bytes

    // If the total size exceeds 300MB, alert the user and stop further uploads
    if (newTotalSize > MAX_SIZE) {
        return;  // Stop here, no further action
    }
      if (image.length >= 10) {
        alert("You can upload a maximum numbers of files only.");
        return; // Stop further uploads
      }

      // If size is valid, proceed with adding the file
      setimage((prev) => {
          const newImages = [...prev, { src: URL.createObjectURL(file), file }];
          if (selectedImage === null) {
              setSelectedImage(newImages[0]);
          }
          return newImages;
      });

      // Clear the input field after selecting a file
      e.target.value = "";
  } else {
      alert("Only images, videos, and PDFs are allowed.");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title|| image.length === 0) {
    alert("Please fill out all fields and select files.");
    return;
  }

  const formdata = new FormData();
  formdata.append("title", title);
if(image){
  for (let i = 0; i < image.length; i++) {
    formdata.append("newsimage", image[i].file);
  }
} 
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to create a post.");
    navigate("/login"); // Redirect to login page if no token
    return;
  }

  try {
    const response = await axios.post(
      `${backendurl}/upload/file/news`, 
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Add the token in the headers
        },
      }
    );
    const newfilterdata=[response.data.data,...filterdata]
      
    setfilterdata(newfilterdata)
    settitle("");
    setimage([]);
    setSelectedImage(null);
  } catch (error) {
   localStorage.removeItem("token");
   navigate("/login")
  }
};
const handledeletenews = async (e, id) => {
  e.stopPropagation();
  const token = localStorage.getItem('token'); // Get token from localStorage
  if (!token) {
    navigate('/login'); // Redirect if no token
    return;
  }
  try {
    const response = await axios.delete(`${backendurl}/upload/file/news/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseremaining = response.data.remainingPosts;
    const remainalso = responseremaining.reverse();
    setfilterdata(remainalso)
  } catch (error) {
  }
}
useEffect(() => {
  if (searchQuery.trim() === "") {
    // If the search query is empty or just spaces, set filtered data to an empty array
    setactualupdate([]);  // Show empty array when query is cleared
  } else {
    // Otherwise, filter the data based on the query
    const filteredData = updateddata.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setactualupdate(filteredData);  // Update the filtered data
  }
}, [searchQuery, updateddata.length>0]);
  return(
    <div className="alwaysmain">
      <Navbar/>
      <div className="newscontainer" onScroll={handleScroll}>
        <div className="createsearch">
          <div className="creates" onClick={handleadds} >
            <FontAwesomeIcon icon={faPlus} className="newsadd"/>
            <span className="add">add update</span>
          </div>
          <input type="text" name="" id="" className="newssearch" placeholder="search update..." onChange={handleSearch}/>
        </div>
        {newspost===true&&( 
          <div className="newcollectionadd">
          <div className="posting">
          <div className="inputholders">
            <div className="inputpics">

              {image.length > 0 ? (image.map((current, index) => (
                <div key={index} className="divimages" onClick={() => handleImageClick(current)}>
                  {current.file.type.startsWith("image/") ? (<img src={current.src} alt="image not found" className="imageshows" />) : current.file.type.startsWith("video/") ? (<video autoPlay muted loop className="imageshows"><source src={current.src} type={current.file.type} /></video>) : (<iframe src={current.src} className="imageshows"></iframe>)}
                </div>
              ))) : (<div className="managers">
                <div className="divimagetwos"><p className="uploadparagraphs">Upload</p></div> <div className="divimagetwos"><p className="uploadparagraphs">Upload</p></div>
              </div>)}

            </div>
            <div className="inputselectors">
              <label htmlFor="inputid" className="label"><FontAwesomeIcon icon={faPlus} className="pluss" /> </label>
              <input type="file" name="newsimage" id="inputid" className="inputclasss" onChange={handlefilechange} required />
            </div>
            <div className="showresults">
              {selectedImage ? (
                selectedImage.file.type.startsWith("video/") ? (
                  <video autoPlay muted loop className="bigshowvideos"  >
                    <source src={selectedImage.src} type={selectedImage.file.type} />

                  </video>
                ) : selectedImage.file.type.startsWith("image/") ? (
                  <img src={selectedImage.src} alt="Selected" className="bigshowimages" />
                ) : (<iframe src={selectedImage.src} allow="Selected" className="bigshowimages"></iframe>)
              ) : (
                <div className="showresultonlys"></div>
              )}
              <div className="titles">
                <input type="text" className="titleinputs" placeholder="Set Title Of Updates" onChange={handletitle} value={title} required />
              </div>
            </div>
          </div>
          <div className="closeandadd">
              <div className="close" onClick={handleadd}>
              <FontAwesomeIcon icon={faX}  className="closeicon"/>
              <span className="discard">discard update</span>
              </div>
              <div className="publish" onClick={handleSubmit}>
                <FontAwesomeIcon icon={faAdd} className="publishicon"/>
                <span className="publishadd">publish update</span>
              </div>
            </div>
          </div>
          <div className="collectionnews">
{filterdata.length>0?(
  <div className="collectionnewsholder">
    {filterdata.map((current,index)=>{
  return(
    <div className="newsholder" key={index}>
      <div className="imageanddelete">
      {current.images[0].endsWith('.jpg') || current.images[0].endsWith('.jpeg') || current.images[0].endsWith('.png') || current.images[0].endsWith('.gif') || current.images[0].endsWith('.bmp') ? (
    <img 
      src={`${backendurl}/${current.images[0]}`} 
      alt={current.title} 
      className="newsimage" 
    />
  ) : current.images[0].endsWith('.mp4') || current.images[0].endsWith('.webm') || current.images[0].endsWith('.ogg') ? (
    <video 
      className="newsimage" 
     muted autoPlay loop
      src={`${backendurl}/${current.images[0]}`} 
      alt={current.title} 
    />
  ) : current.images[0].endsWith('.pdf') ? (
    <iframe 
      className="newsimage" 
      src={`${backendurl}/${current.images[0]}`} 
      title={current.title} 
      width="100%" 
      height="500px" 
    />
  ) : (
    <p>Unsupported media type</p>
  )}
        <FontAwesomeIcon icon={faTrash} className="deletenews" onClick={(e)=>{handledeletenews(e,current._id)}}/>
      </div>
      <div className="newstitlediv">
        <p className="newstitle" >{current.title.length>20?current.title.slice(0,20)+"...":current.title}</p>
      </div>
    </div>
  )
    })}
  </div>
):(<div className="nocontain"><p className="notitle">create some news</p> </div>)}
          </div>
          </div>
        )}
        {actualupdate.length>0?(<div className="actualnews">
         {actualupdate.map((current,index)=>{
          const currentIndex = imageIndexes[current._id] || 0;
         return(
          <div className="container" key={index}>
            <div className="imageandcreated">
              <div className="imageprofilediv">
                  <img src={`${backendurl}/${current.createdBy.profile}`} alt="" className="imageprofile" onClick={(e)=>{handlenewsinfo(e,current.createdBy._id)}}/>
              </div>
              <div className="createtitle">
                       <p className="titlething">{current.title}---{current.createdBy.name}</p>
              </div>
            </div>
            <div className="postingimage">
                <FontAwesomeIcon icon={faArrowLeft} className="arrowleft"  onClick={(e) => handlePrevImage(e, current._id, current.images.length)}/>
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
                    src={`${backendurl}${current.images[currentIndex].imgsrc}`}
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
                    src={`${backendurl}${current.images[currentIndex].imgsrc}`}
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
                  <iframe src={`${backendurl}/${current.images[currentIndex]}`} frameborder="0" className="imagesshown"></iframe>
                ) : null}
              </>
            )}
               <FontAwesomeIcon icon={faArrowRight} className="arrowright"onClick={(e) => handleNextImage(e, current._id, current.images.length)}/>
               </div>
          </div>
         )
         })}
        </div>):(<div className="actualnews">
         {realchunkdata.map((current,index)=>{
          const currentIndex = imageIndexes[current._id] || 0;
         return(
          <div className="container" key={index}>
            <div className="imageandcreated">
              <div className="imageprofilediv">
                  <img src={`${backendurl}/${current.createdBy.profile}`} alt="" className="imageprofile" onClick={(e)=>{handlenewsinfo(e,current.createdBy._id)}}/>
              </div>
              <div className="createtitle">
                       <p className="titlething">{current.title}---{current.createdBy.name}</p>
              </div>
            </div>
            <div className="postingimage">
                <FontAwesomeIcon icon={faArrowLeft} className="arrowleft"  onClick={(e) => handlePrevImage(e, current._id, current.images.length)}/>
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
                    src={`${backendurl}${current.images[currentIndex].imgsrc}`}
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
                    src={`${backendurl}${current.images[currentIndex].imgsrc}`}
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
                  <iframe src={`${backendurl}/${current.images[currentIndex]}`} frameborder="0" className="imagesshown"></iframe>
                ) : null}
              </>
            )}
               <FontAwesomeIcon icon={faArrowRight} className="arrowright"onClick={(e) => handleNextImage(e, current._id, current.images.length)}/>
               </div>
          </div>
         )
         })}
        </div>)}
      </div>
    </div>
  )
}