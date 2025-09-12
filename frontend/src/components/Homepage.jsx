import React, { useEffect } from 'react';import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../pages/chatSection/Chatlist";
import { useChatStore } from '../store/chatStore';
import useUserStore from '../store/useUserStore';

const Homepage = () => {
    const { conversations, fetchConversations } = useChatStore();
    const { user } = useUserStore();
    
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    const contacts = conversations.data?.map(convo => {
        const otherUser = convo.participants?.find(p => p._id !== user._id);
        
      
        return {
            ...otherUser,
            conversation: convo
        };
    }).filter(contact => contact && contact.username); 

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='h-full'
            >
                {/* Now pass the mapped contacts list to Chatlist */}
                <ChatList contacts={contacts} />
            </motion.div>
        </Layout>
    );
}

export default Homepage;