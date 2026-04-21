const supabase = require('../supabase');

const sendNotification = async (app, userId, message) => {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, message })
    .select()
    .single();
  if (error) throw error;

  const io          = app.get('io');
  const onlineUsers = app.get('onlineUsers');
  const socketId    = onlineUsers?.get(+userId); // coerce to number to match registration
  console.log('[notify] userId:', +userId, '| socketId:', socketId, '| onlineUsers:', onlineUsers?.size);

  if (io && socketId) {
    io.to(socketId).emit('notification', {
      id:        notification.id,
      userId:    notification.user_id,
      message:   notification.message,
      isRead:    notification.is_read,
      createdAt: notification.created_at,
    });
  }

  return notification;
};

module.exports = { sendNotification };
