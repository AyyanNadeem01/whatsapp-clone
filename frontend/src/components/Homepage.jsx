// import React, { useEffect, useState } from 'react';
// import Layout from "./Layout";
// import { motion } from "framer-motion";
// import ChatList from "../pages/chatSection/Chatlist";
// import useLayoutStore from '../store/layoutstore';
// import { getAllUsers } from '../services/user.service';

// const Homepage = () => {

//     const [allUsers, setAllUser] = useState([]);
//     const getAllUser = async () => {
//         try {
//             const result = await getAllUsers();
//             if (result.status === "success") {
//                 setAllUser(result.data);
//                 console.log("Fetched contacts:", result.data);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     useEffect(() => {
//         getAllUser();
//     }, []);

//     console.log(allUsers);

//     return (
//         // Pass ChatList as a child to the Layout component
//         <Layout>
//             <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//                 className='h-full'
//             >
//                 <ChatList contacts={allUsers} />
//             </motion.div>
//         </Layout>
//     );
// }

// export default Homepage;

import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../pages/chatSection/Chatlist";
import { getAllUsers } from "../services/user.service";
import socketService from "../services/socketService";
import useUserStore from "../store/useUserStore"; 
import useLayoutStore from "../store/layoutstore";

const Homepage = () => {
  const [allUsers, setAllUser] = useState([]);
  const { user } = useUserStore(); 
  const selectedContact = useLayoutStore((s) => s.selectedContact);

  const getAllUser = async () => {
    try {
      const result = await getAllUsers();
      if (result.status === "success") {
        setAllUser(result.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUser();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    // Connect and tell backend who we are
    socketService.connect(user._id);

    const handleReceiveMessage = (msg) => {
      console.log("New message received:", msg);

      setAllUser((prev) => {
        const otherId = msg.sender?._id === user._id ? msg.receiver?._id : msg.sender?._id;
        let found = false;
        const updated = prev.map((c) => {
          if (c._id === otherId) {
            found = true;
            const increment = selectedContact?._id === otherId ? 0 : 1;
            return {
              ...c,
              conversation: {
                ...c.conversation,
                lastMessage: msg,
                unreadCount: (c.conversation?.unreadCount || 0) + increment,
              },
            };
          }
          return c;
        });

        if (!found) {
          const other = msg.sender._id === user._id ? msg.receiver : msg.sender;
          const newContact = {
            _id: other._id,
            username: other.username,
            profilePicture: other.profilePicture,
            conversation: { lastMessage: msg, unreadCount: 1 },
          };
          return [newContact, ...updated];
        }

        updated.sort((a, b) => {
          const aTime = a.conversation?.lastMessage?.createdAt
            ? new Date(a.conversation.lastMessage.createdAt).getTime()
            : 0;
          const bTime = b.conversation?.lastMessage?.createdAt
            ? new Date(b.conversation.lastMessage.createdAt).getTime()
            : 0;
          return bTime - aTime;
        });

        return updated;
      });
    };

    socketService.on("receive_message", handleReceiveMessage);

    return () => {
      socketService.off("receive_message", handleReceiveMessage);
      socketService.disconnect();
    };
  }, [user, selectedContact]);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-full">
        <ChatList contacts={allUsers} />
      </motion.div>
    </Layout>
  );
};

export default Homepage;
