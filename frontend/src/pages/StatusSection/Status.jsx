// import React, { useEffect, useState } from 'react'
// import useThemeStore from '../../store/themeStore'
// import useUserStore from "../../store/useUserStore"
// import useStatusStore from "../../store/useStatusStore"
// import Layout from "../../components/Layout"
// import StatusPreview from './StatusPreview'
// const Status = () => {
  
//   const [previewContact,setPreviewContact]=useState(null)
//   const [currentStatusIndex,setCurrentStatusIndex]=useState(0)
//   const [showOptions,setOptions]=useState(false)
//   const [selectedFile,setSelectedFile]=useState(null)
//   const [showCreateModal,setShowCreateModal]=useState(false)
//   const [newStatus,setNewStatus]=useState("")
//   const [filePreview,setFilePreview]=useState(null)


//   const {theme}=useThemeStore()
//   const {user}=useUserStore()

//   const {statuses,loading,error,deleteStatus,reset,initializeSocket,
//     fetchStatuses,createStatus,viewStatus,getStatusViewers,
//     getUserStatuses,getOtherStatuses,clearError,cleanupSocket
//   }=useStatusStore()


//   const userStatuses=getUserStatuses(user?._id)
//   const otherStatuses=getOtherStatuses(user?._id)

//   useEffect(()=>{
//     fetchStatuses();
//     initializeSocket()

//     return ()=>{
//       cleanupSocket

//     }
//   },[user?._id])

//   //clear the error when page is mounts
//   useEffect(()=>{
//     return clearError()
//   },[])



//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setShowFileMenu(false);
//       if (file.type.startsWith("image/")
//       ||file.type.startsWith("video/")) {
//         setFilePreview(URL.createObjectURL(file));
//       }
//     }
//   };

//   const handleCreateStatus=async()=>{
//     if(!newStatus.trim() && !selectedFile) return;
    
//     try {
//       await createStatus({
//         content:newStatus,
//         file:selectedFile
//       })  
//       setNewStatus("")
//       setSelectedFile(null)
//       setFilePreview(null)
//       setShowCreateModal(false)
//     } catch (error) {
//       console.error("Error creating status",error)
//     }
//   }


//   const handleViewStatus=async(statusId)=>{
//     try {
//       await viewStatus(statusId)
//     } catch (error) {
//       console.error("Error to view status",error)
//     }
//   } 
  
//   const handleDeleteStatus=async(statusId)=>{
//     try {
//       await deleteStatus(statusId)
//       setShowOption(false)
//     } catch (error) {
//       console.error("Error to delete status",error)
//     }
//   } 


//   const handlePreviewClose=()=>{
//     setPreviewContact(null)
//     setCurrentStatusIndex(0)
//   }
  

//   const handlePreviewNext=()=>{
//     if(currentStatusIndex<previewContact.statuses.length -1){
//       setCurrentStatusIndex((prev)=>prev+1)
//     }else{
//       handlePreviewClose()
//     }
//   }

//   const handleStatusPreview=(contact,statusIndex=0)=>{
//     setPreviewContact(contact)
//     setCurrentStatusIndex(statusIndex)

//     if(contact.statuses[statusIndex]){
//       handleViewStatus(contact.statuses[statusIndex].id)
//     }
//   }



//   return (
//     <Layout
//     isStatusPreviewOpen={!!previewContact}
//     statusPreviewContent={
//       previewContact && (
//         <StatusPreview
//         contact={previewContact}
//         currentIndex={currentStatusIndex}
//         onClose={handlePreviewClose}
//         onNext={handlePreviewNext}
//         onPrev={handlePreviewPrev}
//         theme={theme}
//         currentUser={user}/>
//       )
//     }/>
//   )
// }

// export default Status
import React, { useEffect, useState } from 'react'
import useThemeStore from '../../store/themeStore'
import useUserStore from "../../store/useUserStore"
import {motion} from "framer-motion"
import useStatusStore from "../../store/useStatusStore"
import Layout from "../../components/Layout"
import StatusPreview from './StatusPreview'
import { RxCross2 } from "react-icons/rx";

const Status = () => {
  const [previewContact, setPreviewContact] = useState(null)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [showOptions, setOptions] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [filePreview, setFilePreview] = useState(null)
  const [showFileMenu, setShowFileMenu] = useState(false)

  const { theme } = useThemeStore()
  const { user } = useUserStore()
  const {
    statuses, loading, error, deleteStatus, reset,
    initializeSocket, fetchStatuses, createStatus,
    viewStatus, getStatusViewers,
    getUserStatuses, getOtherStatuses,
    clearError, cleanupSocket
  } = useStatusStore()

  const userStatuses = getUserStatuses(user?._id)
  const otherStatuses = getOtherStatuses(user?._id)

  useEffect(() => {
    fetchStatuses();
    initializeSocket();
    return () => {
      cleanupSocket(); // ✅ FIXED
    }
  }, [user?._id]);

  useEffect(() => {
    clearError();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false); // ✅ Only if you keep showFileMenu
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatus.trim() && !selectedFile) return;

    try {
      await createStatus({
        content: newStatus,
        file: selectedFile
      });
      setNewStatus("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating status", error);
    }
  };

  const handleViewStatus = async (statusId) => {
    try {
      await viewStatus(statusId);
    } catch (error) {
      console.error("Error viewing status", error);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteStatus(statusId);
      setOptions(false); // ✅ FIXED
    } catch (error) {
      console.error("Error deleting status", error);
    }
  };

  const handlePreviewClose = () => {
    setPreviewContact(null);
    setCurrentStatusIndex(0);
  };

  const handlePreviewNext = () => {
    if (currentStatusIndex < previewContact.statuses.length - 1) {
      setCurrentStatusIndex((prev) => prev + 1);
    } else {
      handlePreviewClose();
    }
  };

  // ✅ FIXED: Added missing function
  const handlePreviewPrev = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex((prev) => prev - 1);
    } else {
      handlePreviewClose();
    }
  };

  const handleStatusPreview = (contact, statusIndex = 0) => {
    setPreviewContact(contact);
    setCurrentStatusIndex(statusIndex);

    if (contact.statuses[statusIndex]) {
      handleViewStatus(contact.statuses[statusIndex].id);
    }
  };

  return (
    <Layout
      isStatusPreviewOpen={!!previewContact}
      statusPreviewContent={
        previewContact && (
          <StatusPreview
            contact={previewContact}
            currentIndex={currentStatusIndex}
            onClose={handlePreviewClose}
            onNext={handlePreviewNext}
            onPrev={handlePreviewPrev} 
            theme={theme}
            currentUser={user}
          />
        )
      }
    >
      <motion.div
      initial={{ opacity: 0 }}
        animate={{ opacity: 1}}
        transition={{ duration: 0.5 }}
      className={`flex-1 h-screen border-r ${theme === "dark"
      ? "bg-[rgb(12,19,24)] text-white border-gray-600" : 
       "bg-gray-100 text-black"}`}>
        <div
        className={`flex justify-between items-center shadow-md ${theme === "dark"
      ? "bg-[rgb(17,27,33)]" : 
      " bg-gray-100"} p-4`}>
          <h2 className='text-2xl font-bold'>
            Status
          </h2>
        </div>

        {error && (
          <div
          className='bg-red-100 border border-red-400 text-red-700
          px-4 py-3 rounded mx-4 mt-2'>
            <span className='block sm:inline'>{error}</span>
            <button 
            onClick={clearError}
            className='float-right text-red-500 hover:text-red-700'>
              <RxCross2 className='h-5 w-5'/>
            </button>
          </div>
        )}

        <div className="overflow-y-auto h-[calc(100-bh-64px)]">

          <div
          className={`flex space-x-4 shadow-md ${theme === "dark"
      ? "bg-[rgb(17,27,33)]" : 
      " bg-white"}`}>
          <div className='relative cursor-pointer'
          onClick={()=>
            userStatuses?handleStatusPreview(userStatuses):setShowCreateModal(true)
          }>

          </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}

export default Status
