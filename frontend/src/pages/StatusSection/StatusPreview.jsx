//src/pages/StatusSection/StatusPreview
import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion";
import formatTimestamp from '../../utils/formatTime';
import {FaTrash} from "react-icons/fa"
const StatusPreview = ({
  contact,
  currentIndex,
  onPrev,
  onNext,
  onDelete,
  onClose,
  theme,
  currentUser,
  loading
}) => {
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);

  const currentStatus = contact?.statuses[currentIndex];
  const isOwner = contact?.id === currentUser?._id;

  // Progress bar timer
  useEffect(() => {
    setProgress(0);
    let current = 0;

    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        onNext();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleViewersToggle = () => setShowViewers(!showViewers);

  const handleDeleteStatus = () => {
    if (onDelete && currentStatus.id) {
      onDelete(currentStatus.id);
    }
    if (contact.statuses.length === 1) {
      onClose();
    } else {
      onPrev();
    }
  };

  if (!currentStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 w-full h-full 
          bg-black bg-opacity-90 z-50 flex items-center justify-center`}
      style={{ backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-4xl mx-auto flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full h-full ${theme === "dark" ? "bg-[#202c33]" : "bg-gray-800"} relative`}
        >

          {/* ======= HEADER (Progress bars + Avatar/Name) ======= */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20">
            {/* Progress Bars */}
            <div className="flex justify-between gap-1 mb-3">
              {contact?.statuses.map((_, index) => (
                <div
                  key={index}
                  className="h-1 bg-gray-400 bg-opacity-50 flex-1 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-150 ease-linear rounded-full"
                    style={{
                      width:
                        index < currentIndex
                          ? "100%"
                          : index === currentIndex
                          ? `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Avatar + Contact Name + Timestamp */}
            <div className="flex items-center space-x-3">
              <img
                src={contact?.avatar}
                alt={contact?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <div>
                <p className="text-white font-semibold">{contact?.name}</p>
                <p className="text-gray-300 text-sm">
                  {formatTimestamp(currentStatus.timestamp)}
                </p>
              </div>
            </div>
          </div>

          {/* ======= STATUS CONTENT ======= */}
          {/* You can render the actual image/video/status content here */}
          <div className="flex items-center justify-center w-full h-full">
            {/* Example placeholder */}
            {currentStatus?.mediaUrl ? (
              <img
                src={currentStatus.mediaUrl}
                alt="status"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-white">No media</p>
            )}

            {/* status action */}
            {isOwner &&(
              <div
              className='flex items-center space-x-2'>
                <button>
                  <FaTrash className="w-4 w-4"/>
              
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default StatusPreview;
