import Navbar from "../component/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Profile() {
  const [image, setimage] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, settitle] = useState("");
  const [description, setdescription] = useState("");
  const [postdata, setpostdata] = useState([]);
  const [thumbnail, setthumbanil] = useState();
  const backendurl=import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
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
      } catch (error) {
        localStorage.removeItem("token")
        navigate("/login");
      }
    };

    checkTokenAndFetchData();
  }, []);

  const handlefilechange = (e) => {
    const file = e.target.files[0];

    // Check if file type is valid
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf")) {

        // Get the total file size by summing up the size of all files
        const newTotalSize = image.reduce((acc, currentImage) => acc + currentImage.file.size, 0) + file.size;

        const MAX_SIZE = 15 * 1024 * 1024;  // 20 MB in bytes

        // If the total size exceeds 300MB, alert the user and stop further uploads
        if (newTotalSize > MAX_SIZE) {
            return;  // Stop here, no further action
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

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handletitle = (e) => {
    const newtitle = e.target.value;
    if (newtitle.length <= 44) {
      settitle(newtitle);
    }
  };
  const handledescription = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    const newDescription = e.target.value;
    if (newDescription.length <= 300) {
      setdescription(newDescription);  // Update the description state
    }
  }
  const handlethumbnail = (e) => {
    const filethumbnail = e.target.files[0];
    if (filethumbnail && filethumbnail.type.startsWith("image/")) {
      const objecturl = URL.createObjectURL(filethumbnail);
      setthumbanil({ src: objecturl, filethumbnail });
    } else {
      alert("enter image only")
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || !description || !thumbnail || image.length === 0) {
      alert("Please fill out all fields and select files.");
      return;
    }
  
    const formdata = new FormData();
    formdata.append("title", title);
    formdata.append("description", description);
    formdata.append("thumbnail", thumbnail.filethumbnail);
  if(image){
    for (let i = 0; i < image.length; i++) {
      formdata.append("file", image[i].file);
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
        `${backendurl}/upload/file`, 
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Add the token in the headers
          },
        }
      );
      const newpostdata=[response.data.data,...postdata]
      
      setpostdata(newpostdata); // Use spread operator with empty array as fallback
      settitle("");
      setdescription("");
      setimage([]);
      setSelectedImage(null);
      setthumbanil(null);
    } catch (error) {
      localStorage.removeItem("token"); // Remove invalid tokenc
     navigate("/login")
    }
  };
  
  const handledeletepost = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) {
      navigate('/login'); // Redirect if no token
      return;
    }
    try {
      const response = await axios.delete(`${backendurl}/upload/file/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const responseremaining = response.data.remainingPosts;
      const remainalso = responseremaining.reverse();
      setpostdata(remainalso)
    } catch (error) {
    }
  }
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) {
      navigate('/login'); // Redirect if no token
      return;
    }
      try {
        const response = await axios.get(`${backendurl}/upload/file/profile/createdby`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const dataset = response.data;
        
        setpostdata(dataset.reverse()); // Set posts directly from the response
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [navigate]);


  const handleinfodiv = (e, id) => {
    e.stopPropagation();
    navigate(`/detail/review/${id}`)
  }
  return (
    <div className="alwaysmain">


      
        <Navbar />
     




      <div className="inputcontainer">

        <div className="imagefilldiv">
          <div className="inputholder">
            <div className="inputpic">

              {image.length > 0 ? (image.map((current, index) => (
                <div key={index} className="divimage" onClick={() => handleImageClick(current)}>
                  {current.file.type.startsWith("image/") ? (<img src={current.src} alt="image not found" className="imageshow" />) : current.file.type.startsWith("video/") ? (<video autoPlay muted loop className="imageshow"><source src={current.src} type={current.file.type} /></video>) : (<iframe src={current.src} className="imageshow"></iframe>)}
                </div>
              ))) : (<div className="manager">
                <div className="divimagetwo"><p className="uploadparagraph">Upload</p></div> <div className="divimagetwo"><p className="uploadparagraph">Upload</p></div>  <div className="divimagetwo"><p className="uploadparagraph">Upload</p></div> 
              </div>)}

            </div>
            <div className="inputselector">
              <label htmlFor="inputid" className="label"><FontAwesomeIcon icon={faPlus} className="plus" /> </label>
              <input type="file" name="file" id="inputid" className="inputclass" onChange={handlefilechange} required />
            </div>
            <div className="showresult">
              {selectedImage ? (
                selectedImage.file.type.startsWith("video/") ? (
                  <video autoPlay muted loop className="bigshowvideo"  >
                    <source src={selectedImage.src} type={selectedImage.file.type} />

                  </video>
                ) : selectedImage.file.type.startsWith("image/") ? (
                  <img src={selectedImage.src} alt="Selected" className="bigshowimage" />
                ) : (<iframe src={selectedImage.src} allow="Selected" className="bigshowimage"></iframe>)
              ) : (
                <div className="showresultonly"></div>
              )}
              <div className="title">
                <input type="text" className="titleinput" placeholder="Set Title" onChange={handletitle} value={title} required />
              </div>
            </div>
          </div>
          
            {image.length > 0 && title.length > 4 &&
            <div className="detaildiv">
             <div className="thumbnail">
              <div className="uploadthumbnail">
                {thumbnail ? <img src={thumbnail.src} alt="" className="imageclass" /> : (<div className="uploaded"><p className="paragraph">Upload Thumbnail</p> </div>)}
              </div>
              <div className="selectthumbnail">
                <label htmlFor="selectthumbnail"><FontAwesomeIcon icon={faPlus} className="iconplus" /></label>
                <input type="file" name="thumbnail" id="selectthumbnail" className="thumbnailinput" onChange={handlethumbnail} required />
              </div>
              <div className="description">
                <textarea className="descriptioninput" placeholder="Set description of your project...." onChange={handledescription} value={description} required />
              </div>
            </div>
            </div>
            }

            <div className="finish">
              <form ><button className="button" onClick={handleSubmit}>send data</button></form>
            </div>

        





        </div>

        <div className="inputpost">
          <div className="postholder">

            {postdata.length > 0 ? (postdata &&postdata.map((current, index) => {
              return (
                <div className="postdiv" key={index} onClick={(e) => { handleinfodiv(e, current._id) }}>

                  <div className="showpostanddelete">
                    <div className="show">
                      <img src={`${backendurl}/${current.thumbnail}`} alt="Selected" className="showimage" />

                    </div>
                    <div className="delete">
                      <FontAwesomeIcon icon={faTrash} className="trash" onClick={(e) => { handledeletepost(e, current._id) }} />
                    </div>
                  </div>

                  <div className="title">
                    <p className="ptitle">{current.title}</p>
                  </div>

                </div>
              )
            })) : (<div><p className="wrongparagraph">Uff! Create Some Content</p></div>)}


          </div>
        </div>

 



      </div>






    </div>
  )
}
