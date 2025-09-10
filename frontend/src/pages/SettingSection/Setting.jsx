import React, { useState } from 'react'
import useThemeStore from '../../store/themeStore'
import useUserStore from "../../store/useUserStore"
import { FaSearch } from "react-icons/fa";
import Layout from "../../components/Layout"
import { logoutUser } from "../../services/user.service"
import { toast } from "react-toastify"
const Setting = () => {
  const [isThemeDialogOpen, setIsDialogOpen] = useState(false)
  const { theme } = useThemeStore()
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
</div>
                </div>
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

            </div>

      </div>
    </Layout>
  )
}

export default Setting
