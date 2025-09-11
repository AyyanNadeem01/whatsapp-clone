import React, { useState } from 'react'
import useThemeStore from '../../store/themeStore'
import useUserStore from "../../store/useUserStore"
import { FaSignInAlt,FaComment,FaQuestionCircle,FaUser,FaSearch, FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom"
import Layout from "../../components/Layout"
import { logoutUser } from "../../services/user.service"
import { toast } from "react-toastify"
const Setting = () => {
  const [isThemeDialogOpen, setIsDialogOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()

  const { user, clearUser } = useUserStore()

  const toggleThemeDialog = () => {
    setIsDialogOpen(!isThemeDialogOpen)
  }
  const handleLogout = async () => {
    try {
      await logoutUser()
      clearUser()
      toast.success("user logged out successfully")
    } catch (error) {
      console.error("error :", error)
    }
  }
  return (
    <Layout
      isThemeDialogOpen={isThemeDialogOpen}
      toggleThemeDialog={toggleThemeDialog}
    >
      <div
        className={`flex h-screen ${theme === "dark"
          ? "bg-[rgb(17,27,33)] text-white" : "bg-white text-black"}`}>
            <div className={`w-[400px] border-r 
              ${theme==="dark"?"border-gray-600":"border-gray-200"}`}>
                <div className='p-4'>
                  <h1 className='text-xl font-semibold mb-4'>Setting</h1>
<div className='relative mb-4'>
  <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
  <input
    placeholder="search setting"
    className={`w-full ${theme==="dark"
      ?"bg-[#202c33] text-white"
      :"bg-gray-100 text-black"}
      border-0 pl-10 placeholder-gray-400 rounded p-2`} 
  />
                    <div className={`flex items-center gap-4 p-3
                      ${theme==="dark"?"hover:bg-[#202c33]":
                        "hover:bg-gray-100"} rounded-lg cursor-pointer
                        mb-4
                      `}>
                          <img src={user.profilePicture} alt="profile" 
                          className='w-14 h-14 rounded-full'/>
                   <div>
                    <h2 className='fonr-semibold'>
                        {user?.username}
                    </h2>
                    <p className='text-sm text-gray-400'>
                        {user?.about}
                    </p>
                   </div>
                    </div>
                      
              {/* menuitems */}
              <div
              className='h-[calc(100vh-200px)] overflow-y-auto'>
                  <div className="space-y-1">
                    {
                        [
                          {icon:FaUser,label:"Account",href:"/user-profile"},
                           {icon:FaComment,label:"Chats",href:"/"},
                            {icon:FaQuestionCircle,label:"Help",href:"/help"}
                        ].map((item)=>(
                          <Link
                          to={item.href}
                          key={item.table}
                          className={`w-full flex items-center gap-3
                             p-2 rounded ${theme==="dark"?
                              "text-white hover:bg-[#202c33]"
                              :"text-black hover:bg-gray-100"}`}>
                                <item.icon className='h-5 w-5'/>
                                <div className={`border-b ${theme==="dark"?
                                "border-gray-700":"border-gray-200"}
                                 w-full p-4`}>
                                  {item.label}
                                </div>
                              </Link>
                        ))
                    }
<button
  onClick={toggleTheme}
  className={`w-full flex items-center gap-3 p-2 rounded
    ${theme==="dark"
      ? "text-white hover:bg-[#202c33]"
      : "text-black hover:bg-gray-100"}`}
>
  {theme==="dark" ? (
    <FaMoon className='h-5 w-5'/>
  ) : (
    <FaSun className="h-5 w-5"/>
  )}
  <div
    className={`flex flex-col text-start border-b 
      ${theme==="dark" ? "border-gray-700" : "border-gray-200"} 
      w-full p-2`}
  >
    Theme 
    <span className='ml-auto text-sm text-gray-400'>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </span>
  </div>
</button>

</div>

<button onClick={handleLogout}
className={`w-full flex items-center gap-3
   p-2 rounded text-red-500 ${theme==="dark"
      ? "text-white hover:bg-[#202c33]"
      : "text-black hover:bg-gray-100"} w-full mt-10 md md:mt-36`}>
  <FaSignInAlt className='h-5 w-5'/>
  Logout
</button>
                </div>
                  </div>
              </div>
                
            </div>

      </div>
    </Layout>
  )
}

export default Setting
