const prisma = require('../prisma');

const sendNotification = async (app, userId, message) => {
  const notification = await prisma.notification.create({
    data: { userId, message },
  });

  const io          = app.get('io');
  const onlineUsers = app.get('onlineUsers');
  const socketId    = onlineUsers.get(userId);

  if (io && socketId) {
    io.to(socketId).emit('notification', notification);
  }

  return notification;
};

module.exports = { sendNotification };