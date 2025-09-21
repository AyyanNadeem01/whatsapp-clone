// import React, { useEffect, useState } from 'react';
// import useLayoutStore from '../store/layoutstore';
// import { useLocation } from 'react-router-dom';
// import useThemeStore from '../store/themeStore';
// import Sidebar from "./Sidebar";
// import { AnimatePresence, motion } from 'framer-motion';
// import ChatWindow from "../pages/chatSection/Chatwindow";

// const Layout = ({
//   children,
//   isThemeDialogOpen,
//   toggleThemeDialog,
//   isStatusPreviewOpen,
//   statusPreviewContent
// }) => {
//   const selectedContact = useLayoutStore(state => state.selectedContact);
//   const setSelectedContact = useLayoutStore(state => state.setSelectedContact);
//   const location = useLocation();
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const { theme, setTheme } = useThemeStore();

//   useEffect(() => {
//     // Reset selected contact on component mount (page reload)
//     setSelectedContact(null);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className={`min-h-screen ${theme === "dark" ? "bg-[#111b21] text-white" : "bg-gray-100 text-black"} flex`}>
//       {!isMobile && <Sidebar />}

//       {/* Main content container with a flex-row for desktop */}
//       <div className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col" : "flex-row"}`}>
        
//         {/* Chat List container */}
//         <motion.div
//           key="chatList"
//           initial={{ x: isMobile ? "-100%" : 0 }}
//           animate={{ x: 0 }}
//           exit={{ x: "-100%" }}
//           transition={{ type: "tween" }}
//           className={`${isMobile ? (selectedContact ? 'hidden' : 'w-full pb-16') : 'w-80'} h-full`}
//         >
//           {children}
//         </motion.div>

//         {/* Chat Window container */}
//         <motion.div
//           key="chatwindow"
//           initial={{ x: isMobile ? "100%" : 0 }}
//           animate={{ x: 0 }}
//           exit={{ x: "100%" }}
//           transition={{ type: "tween" }}
//           className={`${isMobile ? (!selectedContact ? 'hidden' : 'w-full') : 'flex-1'} h-full`}
//         >
//           <ChatWindow
//             selectedContact={selectedContact}
//             setSelectedContact={setSelectedContact}
//             isMobile={isMobile}
//           />
//         </motion.div>
//       </div>

//       {isMobile && <Sidebar />}

//       {/* ... (Theme and Status dialogs) ... */}
//     </div>
//   );
// };

// export default Layout;
import React, { useEffect, useState } from 'react';
import useLayoutStore from '../store/layoutstore';
import { useLocation } from 'react-router-dom';
import useThemeStore from '../store/themeStore';
import Sidebar from "./Sidebar";
import { AnimatePresence, motion } from 'framer-motion';
import ChatWindow from "../pages/chatSection/Chatwindow";

const Layout = ({
  children,
  isThemeDialogOpen,
  toggleThemeDialog,
  isStatusPreviewOpen,
  statusPreviewContent
}) => {
  const selectedContact = useLayoutStore(state => state.selectedContact);
  const setSelectedContact = useLayoutStore(state => state.setSelectedContact);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Reset selected contact on component mount (page reload)
    setSelectedContact(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-[#111b21] text-white" : "bg-gray-100 text-black"
      } flex`}
    >
      {!isMobile && <Sidebar />}

      {/* Main content container */}
      <div
        className={`flex-1 flex overflow-hidden ${
          isMobile ? "flex-col" : "flex-row"
        }`}
      >
        {/* Chat List container */}
        <motion.div
          key="chatList"
          initial={{ x: isMobile ? "-100%" : 0 }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween" }}
          className={`${
            isMobile
              ? selectedContact
                ? "hidden"
                : "w-full pb-16"
              : "w-80"
          } h-full`}
        >
          {children}
        </motion.div>

        {/* Chat Window container */}
        <motion.div
          key="chatwindow"
          initial={{ x: isMobile ? "100%" : 0 }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween" }}
          className={`${
            isMobile
              ? !selectedContact
                ? "hidden"
                : "w-full"
              : "flex-1"
          } h-full`}
        >
          <ChatWindow
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            isMobile={isMobile}
          />
        </motion.div>
      </div>

      {isMobile && <Sidebar />}

      {/* ✅ Status Preview Overlay */}
      {isStatusPreviewOpen && (
        <AnimatePresence>
          {statusPreviewContent}
        </AnimatePresence>
      )}

      {/* (Theme dialog or other modals can be added here if needed) */}
    </div>
  );
};

export default Layout;
