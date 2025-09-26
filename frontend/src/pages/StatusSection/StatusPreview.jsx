import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import formatTimestamp from "../../utils/formatTime";
import {
  FaChevronDown,
  FaEye,
  FaTrash,
  FaTimes,
  FaChevronCircleLeft,
  FaChevronCircleRight,
} from "react-icons/fa";

const StatusPreview = ({
  contact,
  currentIndex,
  onPrev,
  onNext,
  onDelete,
  onClose,
  theme,
  currentUser,
  loading,
}) => {
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);

  const currentStatus = contact?.statuses?.[currentIndex];
  const isOwner = contact?.id === currentUser?._id;

  const handleViewersToggle = () => setShowViewers((prev) => !prev);

  // Progress timer
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
  }, [currentIndex, onNext]);

  const handleDeleteStatus = () => {
    const id = currentStatus?._id || currentStatus?.id;
    if (onDelete && id) onDelete(id);

    if (contact?.statuses?.length === 1) {
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center"
      style={{ backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-4xl mx-auto flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full h-full ${
            theme === "dark" ? "bg-[#202c33]" : "bg-gray-800"
          } relative`}
        >
          {/* === HEADER === */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20">
            {/* Progress Bars */}
            <div className="flex justify-between gap-1 mb-3">
              {contact?.statuses?.map((_, index) => (
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

            {/* Avatar + Name */}
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

          {/* === STATUS CONTENT === */}
          <div className="relative w-full h-full flex items-center justify-center">
            {currentStatus.contentType === "text" ? (
              <p className="text-white text-2xl font-medium text-center px-8">
                {currentStatus.media}
              </p>
            ) : currentStatus.contentType === "image" ? (
              <img
                src={currentStatus.media}
                alt="status"
                className="max-w-full max-h-full object-contain"
              />
            ) : currentStatus.contentType === "video" ? (
              <video
                className="max-w-full max-h-full object-contain"
                controls
                muted
                autoPlay
              >
                <source src={currentStatus.media} type="video/mp4" />
              </video>
            ) : null}
          </div>

          {/* === ACTION BUTTONS === */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteStatus();
              }}
              className="absolute top-4 right-4 z-40
                         text-white bg-red-600 bg-opacity-80
                         rounded-full p-3 hover:bg-opacity-100 transition-all"
              title="Delete Status"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-16 z-40
                       text-white bg-black bg-opacity-60
                       rounded-full p-3 hover:bg-opacity-80 transition-all"
            title="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2
                         text-white bg-black bg-opacity-60 rounded-full p-3 
                         hover:bg-opacity-80 transition-all z-30"
            >
              <FaChevronCircleLeft className="h-6 w-6" />
            </button>
          )}
          {currentIndex < contact.statuses.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-white bg-black bg-opacity-60 rounded-full p-3 
                         hover:bg-opacity-80 transition-all z-30"
            >
              <FaChevronCircleRight className="h-6 w-6" />
            </button>
          )}

          {/* === VIEWERS (Owner Only) === */}
          {isOwner && (
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewersToggle();
                }}
                className="flex items-center justify-between w-full
                           text-white bg-black bg-opacity-50 rounded-lg px-4
                           py-2 hover:bg-opacity-70 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <FaEye className="w-4 h-4" />
                  <span>{currentStatus?.viewers?.length || 0}</span>
                </div>
                <FaChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showViewers ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showViewers && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 bg-black bg-opacity-30 rounded-lg
                               p-4 max-h-40 overflow-y-auto"
                  >
                    {loading ? (
                      <p className="text-white text-center">Loading Viewers...</p>
                    ) : currentStatus?.viewers?.filter(
                        v => v._id !== currentUser?._id   // ✅ filter yourself
                      ).length > 0 ? (
                      <div className="space-y-2">
                        {currentStatus.viewers
                          .filter((v) => v._id !== currentUser?._id) // ✅
                          .map((viewer) => (
                            <div
                              key={viewer?._id}
                              className="flex items-center space-x-3"
                            >
                              <img
                                src={viewer.profilePicture}
                                alt={viewer.username}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <span className="text-white">
                                {viewer.username}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-white text-center">No Viewers Yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusPreview;
