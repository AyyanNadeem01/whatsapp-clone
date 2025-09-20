// import {create} from "zustand"
// import { getSocket, initializeSocket } from "../services/chat.service"
// import axiosInstance from "../services/url.service";

// const useStatusStore=create((set,get)=>({
//     //state
//     statuses:[],
//     loading:false,
//     error:null,

//     //Active
//     setStatuses:(statuses)=>set({statuses}),
//     setLoading:(loading)=>set({loading}),
//     setError:(error)=>set({error}),

//     //Initialize the socket listeners
//     initializeSocket:()=>{
//         const socket=getSocket()
//         if(!socket) return;

//         //Real-time status events
//         socket.on("new_status",(newStatus)=>{
//             set((state)=>({
//                 statuses:state.statuses.some((s)=>s._id===newStatus._id)
//                 ? state.statuses: [newStatus,...state.statuses]
//             }))
//         }),

//         socket.on("status_deleted",(statusId)=>{
//             set((state)=>({
//                 statuses:state.statuses.filter((s)=>s._id!==statusId)
//             }))
//         }),
        
//         socket.on("status_viewed",(statusId,viewers)=>{
//             set((state)=>({
//                 statuses:state.statuses.map((status)=>
//                 status._id===statusId? {...status,viewers}:status)
//             }))
//         }),

//     },
    
//     cleanupSocket:()=>{
//         const socket=getSocket()
//         if(socket){
//             socket.off("new_status")
//             socket.off("status_deleted")
//             socket.off("status_viewed")


//         }
//     },
//     //get all statuses
//     fetchStatuses:async()=>{
//         set({loading:true,error:null})
//         try {
//             const {data}=await axiosInstance.get("status")
//             set({statuses:data.data || [],loading:false})
//         } catch (error) {
//             console.error("Error fetching status",error)
//             set({error:error.message,loading:false})
//         }
//     },
//     //create Status
//     createStatus:async(statusData)=>{
//         set({loading:true,error:null})
//         try {
//             const formData=new FormData()
//             if(statusData.file){
//                 formData.append("media",statusData.file)
//             }
//             if(statusData.content?.trim()){
//                 formData.append("content",statusData.content)
//             }

//             const {data}=await axiosInstance.post("/status",formData,{
//                 headers:{"Content-Type":"multipart/form-data"}
//             })

//             //add to status in local state
//             if(data.data){
//                 set((state)=>({
//             statuses:state.statuses.some((s)=>s._id===data.data._id)
//             ? state.statuses:[data.data,...state.statuses]
//                 }))
//             }

//             return data.data
//         } catch (error) {
//             console.error("Error Creating Status",error)
//             set({error:error.message,loading:false})
//             throw error
//         }
//     },
//     //view Status
//     viewStatus:async(statusId)=>{
//         try {
//             await axiosInstance.put(`status/${statusId}/view`)
//             set((state)=>({
//                 statuses:state.statuses.map((status)=>
//                 status._id===statusId? {...status}:status)
//             }))
//         } catch (error) {
//             set({error:error.message})
//         }
//     },
//     //delete Status
//     deleteStatus:async(statusId)=>{
//         try {
//             set({loading:true,error:null})
//             await axiosInstance.delete(`/status/${statusId}`)
//         set((state)=>({
//                 statuses:state.statuses.filter((s)=>s._id!==statusId)
//             }))
//         } catch (error) {
//             console.error("Error deleting status",error)
//             set({error:error.message,loading:false})
//             throw
//         }
//     },
//     getStatusViewers: async(statusId)=>{
//         try {
//             set({loading:true,error:null})
//             const {data}=await axiosInstance.get(`/status/${statusId}/viewers`)
//             return data.data;
//         } catch (error) {
//             console.error("Error getting status viewrs",error)
//             set({error:error.message,loading:false})
//             throw error
//         }
//     },
//     //helper function for grouped status
//     getGroupedStatus:()=>{
//         const {statuses}=get()
//         return statuses.reduce((acc,status)=>{
//             const statusUserId=status.user?._id
//             if(!acc[statusUserId]){
//                 acc[statusUserId]={
//                     id:statusUserId,
//                     name:status?.user?.username,
//                     avatar:status?.user?.profilePicture,
//                     status:[]
//                 }
//             }
//             acc[statusUserId].statuses.push({
//                 id:status._id,
//                 media:status.content,
//                 contentType:status.contentType,
//                 timestamp:status.createdAt,
//                 viewers:status.viewers,
//             })
//             return acc
//         })
//     },

//     getUserStatuses:(userId)=>{
//         const groupedStatus=get().getGroupedStatus()
//         return userId?groupedStatus[userId]:null
//     },

//     getOtherStatuses:(userId)=>{
//         const groupedStatus=get().getGroupedStatus()
//         return Object.values(groupedStatus).filter(
//             (contact)=>contact._id!==userId)
//     },

//     //clear error
//     clearError:()=> set({error:null}),

//     reset:()=>
//         set({
//             statuses:[],
//             loading:false,
//             error:null
//         }),
// }))

// export default useStatusStore
import { create } from "zustand";
import { getSocket, initializeSocket } from "../services/chat.service";
import axiosInstance from "../services/url.service";

const useStatusStore = create((set, get) => ({
    // --- State ---
    statuses: [],
    loading: false,
    error: null,

    // --- Setters ---
    setStatuses: (statuses) => set({ statuses }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // --- Initialize Socket Listeners ---
    initializeSocket: () => {
        const socket = getSocket();
        if (!socket) return;

        // Real-time status events
        socket.on("new_status", (newStatus) => {
            set((state) => ({
                statuses: state.statuses.some((s) => s._id === newStatus._id)
                    ? state.statuses
                    : [newStatus, ...state.statuses],
            }));
        });

        socket.on("status_deleted", (statusId) => {
            set((state) => ({
                statuses: state.statuses.filter((s) => s._id !== statusId),
            }));
        });

        socket.on("status_viewed", (statusId, viewers) => {
            set((state) => ({
                statuses: state.statuses.map((status) =>
                    status._id === statusId ? { ...status, viewers } : status
                ),
            }));
        });
    },

    // --- Cleanup Socket Listeners ---
    cleanupSocket: () => {
        const socket = getSocket();
        if (socket) {
            socket.off("new_status");
            socket.off("status_deleted");
            socket.off("status_viewed");
        }
    },

    // --- Get all statuses ---
    fetchStatuses: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await axiosInstance.get("status");
            set({ statuses: data.data || [], loading: false });
        } catch (error) {
            console.error("Error fetching status", error);
            set({ error: error.message, loading: false });
        }
    },

    // --- Create Status ---
    createStatus: async (statusData) => {
        set({ loading: true, error: null });
        try {
            const formData = new FormData();
            if (statusData.file) {
                formData.append("media", statusData.file);
            }
            if (statusData.content?.trim()) {
                formData.append("content", statusData.content);
            }

            const { data } = await axiosInstance.post("/status", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Add to state if not already present
            if (data.data) {
                set((state) => ({
                    statuses: state.statuses.some((s) => s._id === data.data._id)
                        ? state.statuses
                        : [data.data, ...state.statuses],
                }));
            }

            return data.data;
        } catch (error) {
            console.error("Error Creating Status", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // --- View Status ---
    viewStatus: async (statusId) => {
        try {
            await axiosInstance.put(`status/${statusId}/view`);
            set((state) => ({
                statuses: state.statuses.map((status) =>
                    status._id === statusId ? { ...status } : status
                ),
            }));
        } catch (error) {
            set({ error: error.message });
        }
    },

    // --- Delete Status ---
    deleteStatus: async (statusId) => {
        try {
            set({ loading: true, error: null });
            await axiosInstance.delete(`/status/${statusId}`);
            set((state) => ({
                statuses: state.statuses.filter((s) => s._id !== statusId),
                loading: false,
            }));
        } catch (error) {
            console.error("Error deleting status", error);
            set({ error: error.message, loading: false });
            throw error; // ✅ fixed
        }
    },

    // --- Get Status Viewers ---
    getStatusViewers: async (statusId) => {
        try {
            set({ loading: true, error: null });
            const { data } = await axiosInstance.get(`/status/${statusId}/viewers`);
            set({ loading: false });
            return data.data;
        } catch (error) {
            console.error("Error getting status viewers", error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // --- Grouped Status Helper ---
    getGroupedStatus: () => {
        const { statuses } = get();
        return statuses.reduce((acc, status) => {
            const statusUserId = status.user?._id;
            if (!statusUserId) return acc;

            if (!acc[statusUserId]) {
                acc[statusUserId] = {
                    id: statusUserId,
                    name: status?.user?.username,
                    avatar: status?.user?.profilePicture,
                    statuses: [], // ✅ fixed
                };
            }

            acc[statusUserId].statuses.push({
                id: status._id,
                media: status.content,
                contentType: status.contentType,
                timestamp: status.createdAt,
                viewers: status.viewers,
            });
            return acc;
        }, {}); // ✅ initial value added
    },

    // --- Get Specific User Statuses ---
    getUserStatuses: (userId) => {
        const groupedStatus = get().getGroupedStatus();
        return userId ? groupedStatus[userId] : null;
    },

    // --- Get Other Users' Statuses ---
    getOtherStatuses: (userId) => {
        const groupedStatus = get().getGroupedStatus();
        return Object.values(groupedStatus).filter(
            (contact) => contact.id !== userId // ✅ fixed
        );
    },

    // --- Clear Error ---
    clearError: () => set({ error: null }),

    // --- Reset Store ---
    reset: () =>
        set({
            statuses: [],
            loading: false,
            error: null,
        }),
}));

export default useStatusStore;
