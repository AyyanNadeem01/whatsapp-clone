const response = require("../utils/responseHandler");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content, messageStatus } = req.body;
        const file = req.file;

        if (!senderId || !receiverId) {
            return response(res, 400, "Sender and Receiver are required.");
        }

        const participants = [senderId, receiverId].sort();

        let conversation = await Conversation.findOne({ participants });

        if (!conversation) {
            conversation = new Conversation({ participants });
            await conversation.save();
        }

        let imageOrVideoUrl = null;
        let contentType = null;

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            if (!uploadResult?.secure_url) {
                return response(res, 400, "Failed to upload media");
            }

            imageOrVideoUrl = uploadResult.secure_url;

            if (file.mimetype.startsWith("image")) {
                contentType = "image";
            } else if (file.mimetype.startsWith("video")) {
                contentType = "video";
            } else {
                return response(res, 400, "Unsupported file type");
            }
        } else if (content?.trim()) {
            contentType = "text";
        } else {
            return response(res, 400, "Message content is required");
        }

        const message = new Message({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus,
        });

        await message.save();

        if (message.content) {
            conversation.lastMessage = message._id;
        }

        conversation.unreadCount += 1;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture");

        return response(res, 201, "Message sent successfully", populatedMessage);

    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};
