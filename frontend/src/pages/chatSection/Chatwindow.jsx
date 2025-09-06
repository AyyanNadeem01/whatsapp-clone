import React, { useEffect, useRef, useState } from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { useChatStore } from "../../store/chatStore";

const isValidate = (date) => {
  return date instanceof Date && !isNaN(date);
};

const Chatwindow = ({ selectedContact, setSelectedContact }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const typingTimeOutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputPicker = useRef(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();

  const {
    messages,
    loading,
    sendMessage,
    receiveMessage,
    fetchMessages,
    fetchConversations,
    conversations,
    startTyping,
    stopTyping,
    isUserTyping,
    getUserLastSeen,
    isUserOnline,
    cleanup,
    addReaction,
    deleteMessage,
  } = useChatStore();

  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);

  useEffect(() => {
    if (selectedContact?._id && conversations?.data?.length > 0) {
      const conversation = conversations?.data?.find((conv) =>
        conv.participants.some(
          (participant) => participant._id === selectedContact?._id
        )
      );
      if (conversation._id) {
        fetchMessages(conversation._id);
      }
    }
  },[selectedContact,conversations]);

  useEffect(()=>{
    fetchConversations();
  },[])

  const scrollToBottom=()=>{
    messageEndRef.current?.scrollToBottom({behavior:"auto"})
  }

  useEffect(()=>{
    scrollToBottom();
  },[messages])

  useEffect(()=>{
    if(message && selectedContact){
      startTyping(selectedContact._id)
    
    if(typingTimeOutRef.current){
      clearTimeout(typingTimeOutRef.current)
    }

    typingTimeOutRef.current=setTimeout(()=>{
      stopTyping(selectedContact?._id)
    },2000)
    }
    return ()=>{
      if(typingTimeOutRef.current){
        clearTimeout(typingTimeOutRef.current)
      }
    }
  },[message,selectedContact,startTyping,stopTyping])

  const handleFileChange=(e)=>{
    const file=e.target.files[0];
    if(file){
      setSelectedFile(file);
      setShowFileMenu(false);
      if(file.type.startsWith("image/")){
        setFilePreview(URL.createObjectURL(file))
      }
    }
  }


  const handleSendMessage=async()=>{
    if(!selectedContact) return;

    setFilePreview(null);
    try{
      const formData =new FormData();
      formData.append("senderId",user?._id)
      formData.append("receiverId",selectedContact?._id)
      
      const status=online?"delivered":"sent";
      formData.append("messageStatus",status);
      if(message.trim()){
        formData.append("content",message.trim());
      }
      //if there is file include that too

      if(selectedFile){
        formData.append("media",selectedFile,selectedFile.name)
      }

      if(!message.trim() && !selectedFile) return ;
      await sendMessage(formData);

      //clear State

      setMessage("");
      setFilePreview(null);
      setSelectedFile(null);
      setShowFileMenu(false);

    }catch(error){
      console.error("Failed to send message",error)
    }
  }

  return <div>chat window</div>;
};

export default Chatwindow;
