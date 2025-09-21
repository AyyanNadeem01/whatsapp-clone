import React,{useState,useEffect} from 'react'
import { motion } from "framer-motion";
const StatusPreview = ({contact,currentIndex,onPrev,onNext,onDelete,onClose,theme,currentUser,loading}) => {
  const [progress,setProgress]=useState(0)
  const [showViewers,setShowViewers]=useState(false)

  const currentStatus=contact?.statuses[currentIndex]
  const isOwner=contact?.id===currentUser?._id
  
  useEffect(()=>{
    setProgress(0)
    
    let current=0

    const interval=setInterval(()=>{
      current +=2
      setProgress(current)
      if(current>=100){
        clearInterval(interval)
        onNext()
      }
    },100)
    return ()=>clearInterval(interval)
  },[currentIndex])


  const handleViewersToggle=()=>{
    setShowViewers(!showViewers)
  }

  const handleDeleteStatus=()=>{
    if(onDelete && currentStatus.id){
      onDelete(currentStatus.id)
    }
    if(contact.statuses.length===1){
      onClose()
    }else{
      onPrev()
    }
  }

  if(!currentStatus) return null;
  return (
   <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        exit={{opacity:0}}
        className={`fixed inset-0 w-full h-full 
          bg-black bg-opacity-90 z-50 flex items-center justify-center`}
      style={{backdropFilter:"blur(5pxl)"}}
      onClick={onClose}
      >
        <div
        className="relative w-full h-full max-w-4xl
        mx-auto flex justify-center items-center"
        onClick={(e)=>e.stopPropagation()}>
          <div
          className={`w-full h-full ${theme==="dark"?
            "bg-[#202c33]":"bg-gray-800"
          } relative`}>

          </div>
        </div>
      </motion.div>
  )
}

export default StatusPreview
