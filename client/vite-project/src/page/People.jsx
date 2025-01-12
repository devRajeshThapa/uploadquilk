import Navbar from "../component/Navbar";
import "./People.css"
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function People(){
  
  const[peopledata,setpeopledata]=useState([]);
  const[peoplename,setpeoplename]=useState("");
  const backendurl=import.meta.env.VITE_BACKEND_URL;

  const navigate=useNavigate();
const handleinputdata=(e)=>{
  setpeoplename(e.target.value)
}
const handleprofile=(e,id)=>{
 navigate(`/profile/info/${id}`)
}

  useEffect(()=>{
    const fetchpeople=async()=>{
try{
const response=axios.get(`${backendurl}/upload/file/people`);
const people=(await response).data.data;
setpeopledata(people.reverse())
}catch(error){
  console.log(error)
}
    }
    fetchpeople()
  },[navigate])
  const filteredPeople = peopledata.filter((person) =>
  
    person.name.toLowerCase().includes(peoplename.toLowerCase())
  );
  return(
    <div className="alwaysmain">
<Navbar/>

<div className="usercontainer">

<div className="inputdiv">
  <input type="text" name="" id=""className="searchname" placeholder="search name..." value={peoplename} onChange={handleinputdata}/>
</div>

<div className="userdiv">

{filteredPeople.length > 0 ? (peopledata &&filteredPeople.map((current, index) => {
              return (
                <div className="personcontainer" key={index} >
                      <img src={current.profile} alt="Selected" className="personimage" onClick={(e)=>{handleprofile(e,current._id)}} />
                      <p className="personname">{current.name}</p>
                </div>
              )
            })) : (<div className="nodiv"><p className="nocontent">Uff !!! No User</p></div>)}

  
</div>





</div>

    </div>
  )
}