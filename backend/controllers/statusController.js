const response = require("../utils/responseHandler");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Status = require("../models/Status");

exports.createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user.userId;
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType || "text";

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            if (!uploadResult?.secure_url) {
                return response(res, 400, "Failed to upload media");
            }

            mediaUrl = uploadResult.secure_url;

            if (file.mimetype.startsWith("image")) {
                finalContentType = "image";
            } else if (file.mimetype.startsWith("video")) {
                finalContentType = "video";
            } else {
                return response(res, 400, "Unsupported file type");
            }
        } else if (content?.trim()) {
            finalContentType = "text";
        } else {
            return response(res, 400, "Status content is required");
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const status = new Status({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType,
            expiresAt,
        });

        await status.save();

        const populatedStatus = await Status.findById(status._id)
            .populate("user", "username profilePicture")
            .populate("viewers", "username profilePicture");

            //emit socket event
            if(req.io && req.socketUserMap){
                //broadcast to all connecting user except creator
                for(const [connectedUserId, socketId] of req.socketUserMap){
                    if(connectedUserId!==userId){
                        req.io.to(socketId).emit("new_status",populatedStatus)
                    }
                }
            }
        return response(res, 201, "Status created successfully", populatedStatus);

    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};


exports.getStatus = async (req, res) => {
    try {
        const statuses = await Status.find({
            expiresAt: { $gt: new Date() }
        })
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture")
        .sort({ createdAt: -1 });

        return response(res, 200, "Statuses retrieved successfully", statuses);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};



exports.viewStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;

    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, "Status not found");
        }

        if (!status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();
        } else {
            console.log("User already viewed status");
        }

        const updatedStatus = await Status.findById(statusId)
            .populate("user", "username profilePicture")
            .populate("viewers", "username profilePicture");

            //emit socket event
            if(req.io && req.socketUserMap){
                const statusOwnerSocketId=req.socketUserMap.get(status.user._id.toString())
                if(statusOwnerSocketId){
                    const viewData={
                        statusId,
                        viewerId:userId,
                        totalViewers: updatedStatus.viewers.length,
                        viewers: updatedStatus.viewers
                    }
                    req.io.to(statusOwnerSocketId).emit("status_viewed",viewData)
                }else{
                    console.log("Status Owner are not connected")
                }
            }
            
        return response(res, 200, "Status viewed successfully", updatedStatus);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};



exports.deleteStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;

    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, "Status not found");
        }

        if (status.user.toString() !== userId) {
            return response(res, 403, "Not authorized to delete this status");
        }

        await status.deleteOne();
        
            //emit socket event
            if(req.io && req.socketUserMap){
                //broadcast to all connecting user except creator
                for(const [connectedUserId, socketId] of req.socketUserMap){
                    if(connectedUserId!==userId){
                        req.io.to(socketId).emit("status_deleted",statusId)
                    }
                }
            }
        return response(res, 200, "Status deleted successfully");
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};
