const express = require("express");
const chatController = require("../controllers/chatController");
const { multerMiddleware } = require("../config/cloudinaryConfig");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-message", authMiddleware,chatController.sendMessage);
router.get("/conversations",authMiddleware,chatController.getConversation);
router.get("/conversation/:conversationId/messages",authMiddleware,chatController.getMessages);

router.put("/messages/read",authMiddleware,chatController.markAsRead);
router.delete("/messages/:messageId",authMiddleware,chatController.deleteMessage);
module.exports = router;
