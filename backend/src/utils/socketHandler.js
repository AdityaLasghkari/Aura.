import { Server } from 'socket.io';
import Room from '../models/Room.js';
import User from '../models/User.js';

const resolveUserId = async (userId) => {
    if (userId && typeof userId === 'string' && userId.startsWith('kp_')) {
        const user = await User.findOne({ kindeId: userId });
        return user ? user._id.toString() : userId;
    }
    return userId;
};

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_room', async ({ roomCode, userId: rawUserId }) => {
            const userId = await resolveUserId(rawUserId);
            console.log(`SYNC_DEBUG: join_room attempt - User: ${userId}, Room: ${roomCode}`);
            socket.join(roomCode);

            try {
                let room = await Room.findOne({ roomCode }).populate('currentSong participants kings');

                if (!room) {
                    console.log(`SYNC_DEBUG: Creating new room ${roomCode} for host ${userId}`);
                    room = await Room.create({
                        roomCode,
                        host: userId,
                        participants: userId ? [userId] : []
                    });
                    room = await Room.findById(room._id).populate('currentSong participants kings');
                } else if (userId) {
                    const isParticipant = room.participants.some(p =>
                        (p._id?.toString() || p.toString()) === userId
                    );

                    if (!isParticipant) {
                        console.log(`SYNC_DEBUG: Adding participant ${userId} to room ${roomCode}`);
                        room.participants.push(userId);
                        await room.save();
                        room = await Room.findById(room._id).populate('currentSong participants kings');
                    }
                }

                console.log(`SYNC_DEBUG: Emitting room_data for ${roomCode}. Participants: ${room?.participants?.length}`);
                io.to(roomCode).emit('room_data', room);
            } catch (error) {
                console.error('JOIN_ROOM_ERROR:', error);
            }
        });

        socket.on('playback_update', async ({ roomCode, isPlaying, currentTime, songId, userId: rawUserId }) => {
            try {
                const userId = await resolveUserId(rawUserId);
                const room = await Room.findOne({ roomCode });
                if (room) {
                    const isHost = room.host.toString() === userId;
                    const isKing = room.kings.some(k => k.toString() === userId);

                    if (isHost || isKing || room.isCollaborative) {
                        // Update room state in DB
                        room.isPlaying = isPlaying;
                        room.currentTime = currentTime;
                        if (songId) room.currentSong = songId;
                        await room.save();

                        // Broadcast to all except sender
                        socket.to(roomCode).emit('playback_sync', { isPlaying, currentTime, songId, userId });
                    }
                }
            } catch (error) {
                console.error('PLAYBACK_UPDATE_ERROR:', error);
            }
        });

        socket.on('toggle_collaborative', async ({ roomCode, userId: rawUserId }) => {
            try {
                const userId = await resolveUserId(rawUserId);
                const room = await Room.findOne({ roomCode });
                if (room && room.host.toString() === userId) {
                    room.isCollaborative = !room.isCollaborative;
                    await room.save();
                    io.to(roomCode).emit('room_update', { isCollaborative: room.isCollaborative });
                }
            } catch (error) {
                console.error('TOGGLE_COLLAB_ERROR:', error);
            }
        });

        socket.on('toggle_king', async ({ roomCode, targetUserId: rawTargetId, requesterId: rawRequesterId }) => {
            try {
                const targetUserId = await resolveUserId(rawTargetId);
                const requesterId = await resolveUserId(rawRequesterId);
                const room = await Room.findOne({ roomCode });
                if (room && room.host.toString() === requesterId) {
                    const index = room.kings.indexOf(targetUserId);
                    if (index > -1) {
                        room.kings.splice(index, 1);
                    } else {
                        room.kings.push(targetUserId);
                    }
                    await room.save();
                    const updatedRoom = await Room.findById(room._id).populate('currentSong participants kings');
                    io.to(roomCode).emit('room_data', updatedRoom);
                }
            } catch (error) {
                console.error('TOGGLE_KING_ERROR:', error);
            }
        });

        socket.on('leave_room', async ({ roomCode, userId: rawUserId }) => {
            socket.leave(roomCode);
            try {
                const userId = await resolveUserId(rawUserId);
                const room = await Room.findOne({ roomCode });
                if (room) {
                    room.participants = room.participants.filter(p => p.toString() !== userId);
                    room.kings = room.kings.filter(k => k.toString() !== userId);
                    await room.save();
                    const updatedRoom = await Room.findById(room._id).populate('participants currentSong kings');
                    io.to(roomCode).emit('room_data', updatedRoom);
                }
            } catch (error) {
                console.error('LEAVE_ROOM_ERROR:', error);
            }
        });

        socket.on('send_message', ({ roomCode, message, user }) => {
            io.to(roomCode).emit('new_message', {
                text: message,
                user,
                timestamp: new Date()
            });
        });

        socket.on('update_queue', async ({ roomCode, queue }) => {
            try {
                await Room.findOneAndUpdate({ roomCode }, { queue });
                socket.to(roomCode).emit('queue_updated', queue);
            } catch (error) {
                console.error('UPDATE_QUEUE_ERROR:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export default socketHandler;
