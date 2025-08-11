import React, { useEffect, useState } from 'react';
import Layout from "./Layout";
import { motion } from "framer-motion";
import ChatList from "../pages/chatSection/Chatlist";
import useLayoutStore from '../store/layoutstore';
import { getAllUsers } from '../services/user.service';

const Homepage = () => {
    const setSelectedContact = useLayoutStore(state => state.setSelectedContact);

    const [allUsers, setAllUser] = useState([]);
    const getAllUser = async () => {
        try {
            const result = await getAllUsers();
            if (result.status === "success") {
                setAllUser(result.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getAllUser();
    }, []);

    console.log(allUsers);

    return (
        // Pass ChatList as a child to the Layout component
        <Layout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='h-full'
            >
                <ChatList contacts={allUsers} setSelectedContact={setSelectedContact} />
            </motion.div>
        </Layout>
    );
}

export default Homepage;