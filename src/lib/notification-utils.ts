export const filterAndSortNotifications = (notifications: any[], activeTab: string) => {
  const filtered = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return notification.status?.read === false;
      case 'read':
        return notification.status?.read === true;
      default:
        return true;
    }
  });

  // Sort by creation date, newest first
  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
