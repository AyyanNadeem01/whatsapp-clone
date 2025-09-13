
import React, { useEffect, useState } from "react";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/useUserStore"; 
import { toast } from "react-toastify";
import Layout from "./Layout";
import { updateUserProfile } from "../services/user.service";
import { motion } from "framer-motion";
import { FaCheck,FaCamera, FaPencilAlt ,FaSmile} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

const Userdetail = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEdittingName, setIsEdittingName] = useState(false);
  const [isEdittingAbout, setIsEdittingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);
  const [loading,setLoading]=useState(false)
  const { user, setUser } = useUserStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setAbout(user.about || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (field) => {
    try {
      setLoading(true)
      const formData = new FormData();

      if (field === "name") {
        formData.append("username", name);
        setIsEdittingName(false);
        setShowNameEmoji(false);
      } else if (field === "about") {
        formData.append("about", about);
        setIsEdittingAbout(false);
        setShowAboutEmoji(false);
      } else if (field === "profile" && profilePicture) {
        formData.append("media", profilePicture);
       }

      const updated = await updateUserProfile(formData);
      setUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);

      toast.success("Profile Updated Successfully");
       setLoading(false)
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const handleEmojiSelect = (emoji, field) => {
    if (field === "name") {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full min-h-screen flex flex-col border-r ${
          theme === "dark"
            ? "bg-[rgb(17,27,33)] border-gray-600 text-white"
            : "bg-gray-100 border-gray-200 text-black"
        }`}
      >
        <div className="w-full rounded-lg p-6">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={preview || user?.profilePicture || "/default-avatar.png"} // ✅ fallback image
                  alt="profile"
                  className="w-52 h-52 rounded-full mb-2 object-cover"
                />
                <label
                  htmlFor="profileUpload"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="text-white text-center">
                    <FaCamera className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm">Change</span>
                  </div>
                  <input
                    type="file"
                    id="profileUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview Buttons */}
            {preview && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => handleSave("profile")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                {loading?"Saving...":"Save"}
                </button>
                <button
                  onClick={() => {
                    setProfilePicture(null);
                    setPreview(null);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Discard
                </button>
              </div>
            )}
            <div className={`relative p-4 ${theme==="dark"?
              "bg-gray-800":"bg-white"
            } shadow-sm rounded-lg`}>
                  <label htmlFor="name"
                  className="block text-sm font-medium mb-1 text-gray-500 text-start">
                    Your Name
                  </label>
                  <div className="flex items-center">
                    {isEdittingName?(
                        <input 
                        id="name"
                        type="text" 
                        value={name}
                        onChange={(e)=>{setName(e.target.value)}}
                        className={`w-full px-3 py-2 border rounded-md
                          focus:outline-none focus:ring-2 
                          focus:ring-green-500 ${theme==="dark"?
                            "bg-gray-700 text-white":"bg-white text-black"
                          }`}/>
                    ):(<span className="w-full px-3 py-2 font-bold">
                      {user?.username||name}
                    </span>)}

                    {isEdittingName?(
                      <>
                       <button
                      onClick={()=>handleSave("name")}
                      className="ml-2 focus:outline-none">
                      <FaCheck className="h-5 w-5 text-green-500"/>
                      </button>

                        <button
                      onClick={()=>setShowNameEmoji(!showNameEmoji)}
                      className="ml-2 focus:outline-none">
                      <FaSmile className="h-5 w-5 text-yellow-500"/>
                      </button>

                        <button
                      onClick={()=>{
                            setIsEdittingName(false)
                            setShowNameEmoji(false)
                      }}
                      className="ml-2 focus:outline-none">
                      <MdCancel className="h-5 w-5 text-gray-500"/>
                      </button>
                      </>
                    ):(
                      <button
                      onClick={()=>setIsEdittingName(!isEdittingName)}
                      className="ml-2 focus:outline-none">
                      <FaPencilAlt className="h-5 w-5 text-gray-500"/>
                      </button>
                    )}
                  </div>
                    {showNameEmoji &&(
                      <div className="absolute z-10 -top-80">
                          <EmojiPicker
                          onEmojiClick={(emoji)=>handleEmojiSelect(emoji,"name")}/>
                      </div>

                    )}

            </div>

            <div className={`relative p-4 ${theme==="dark"?
              "bg-gray-800":"bg-white"
            } shadow-sm rounded-lg`}>
                  <label htmlFor="name"
                  className="block text-sm font-medium mb-1 text-gray-500 text-start">
                    About
                  </label>
                  <div className="flex items-center">
                    {isEdittingAbout?(
                        <input 
                        id="about"
                        type="text" 
                        value={about}
                        onChange={(e)=>{setAbout(e.target.value)}}
                        className={`w-full px-3 py-2 border rounded-md
                          focus:outline-none focus:ring-2 
                          focus:ring-green-500 ${theme==="dark"?
                            "bg-gray-700 text-white":"bg-white text-black"
                          }`}/>
                    ):(<span className="w-full px-3 py-2 font-bold">
                      {user?.about||about}
                    </span>)}

                    {isEdittingAbout?(
                      <>
                       <button
                      onClick={()=>handleSave("about")}
                      className="ml-2 focus:outline-none">
                      <FaCheck className="h-5 w-5 text-green-500"/>
                      </button>

                        <button
                      onClick={()=>setShowAboutEmoji(!showAboutEmoji)}
                      className="ml-2 focus:outline-none">
                      <FaSmile className="h-5 w-5 text-yellow-500"/>
                      </button>

                        <button
                      onClick={()=>{
                            setIsEdittingAbout(false)
                            setShowAboutEmoji(false)
                      }}
                      className="ml-2 focus:outline-none">
                      <MdCancel className="h-5 w-5 text-gray-500"/>
                      </button>
                      </>
                    ):(
                      <button
                      onClick={()=>setIsEdittingAbout(!isEdittingAbout)}
                      className="ml-2 focus:outline-none">
                      <FaPencilAlt className="h-5 w-5 text-gray-500"/>
                      </button>
                    )}
                  </div>
                    {showAboutEmoji &&(
                      <div className="absolute z-10 -top-80">
                          <EmojiPicker
                          onEmojiClick={(emoji)=>handleEmojiSelect(emoji,"about")}/>
                      </div>

                    )}

            </div>


          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Userdetail;
