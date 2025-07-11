import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import { User } from "../models/User";

interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const handleSocketConnection = (io: SocketIOServer) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);

      if (!user || user.isBanned) {
        return next(new Error("Authentication error"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.email} connected`);

    // Join user to their role-based room
    socket.join(socket.user?.role);
    socket.join(`user_${socket.user?._id}`);

    // Handle job application notifications
    socket.on("job_applied", (data) => {
      // Notify employers about new applications
      io.to("employer").emit("new_application", {
        message: `New application received for job: ${data.jobTitle}`,
        jobId: data.jobId,
        candidateEmail: socket.user?.email,
        timestamp: new Date(),
      });

      // Notify admins
      io.to("admin").emit("new_application", {
        message: `New application: ${socket.user?.email} applied for ${data.jobTitle}`,
        jobId: data.jobId,
        candidateEmail: socket.user?.email,
        timestamp: new Date(),
      });
    });

    // Handle new job postings
    socket.on("job_posted", (data) => {
      // Notify all candidates about new job postings
      io.to("candidate").emit("new_job", {
        message: `New job posted: ${data.title} at ${data.companyName}`,
        jobId: data.jobId,
        title: data.title,
        companyName: data.companyName,
        location: data.location,
        timestamp: new Date(),
      });

      // Notify admins
      io.to("admin").emit("new_job", {
        message: `New job posted by ${socket.user?.email}: ${data.title}`,
        jobId: data.jobId,
        title: data.title,
        companyName: data.companyName,
        timestamp: new Date(),
      });
    });

    // Handle user ban notifications
    socket.on("user_banned", (data) => {
      // Notify the banned user
      io.to(`user_${data.userId}`).emit("account_banned", {
        message: "Your account has been banned by an administrator",
        timestamp: new Date(),
      });
    });

    // Handle real-time chat between employers and candidates
    socket.on("send_message", (data) => {
      const { recipientId, message, applicationId } = data;

      // Send message to specific recipient
      io.to(`user_${recipientId}`).emit("receive_message", {
        senderId: socket.user?._id,
        senderEmail: socket.user?.email,
        message,
        applicationId,
        timestamp: new Date(),
      });
    });

    // Handle job status updates
    socket.on("job_status_changed", (data) => {
      // Notify all users about job status changes
      io.emit("job_updated", {
        jobId: data.jobId,
        status: data.status,
        title: data.title,
        timestamp: new Date(),
      });
    });

    // Handle typing indicators for chat
    socket.on("typing", (data) => {
      socket.to(`user_${data.recipientId}`).emit("user_typing", {
        userId: socket.user?._id,
        email: socket.user?.email,
      });
    });

    socket.on("stop_typing", (data) => {
      socket.to(`user_${data.recipientId}`).emit("user_stop_typing", {
        userId: socket.user?._id,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.user?.email} disconnected`);
    });
  });
};
