import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div style={styles.container}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.ERROR:
        return '❌';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.INFO:
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return '#d1fae5';
      case NotificationType.ERROR:
        return '#fee2e2';
      case NotificationType.WARNING:
        return '#fef3c7';
      case NotificationType.INFO:
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        return '#065f46';
      case NotificationType.ERROR:
        return '#991b1b';
      case NotificationType.WARNING:
        return '#92400e';
      case NotificationType.INFO:
        return '#1e40af';
      default:
        return '#374151';
    }
  };

  return (
    <div
      style={{
        ...styles.notification,
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
    >
      <div style={styles.notificationContent}>
        <span style={styles.icon}>{getIcon()}</span>
        <div style={styles.textContent}>
          <div style={styles.title}>{notification.title}</div>
          <div style={styles.message}>{notification.message}</div>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              style={styles.actionButton}
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
      <button onClick={onClose} style={styles.closeButton}>
        ×
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '400px',
  },
  notification: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease-out',
  },
  notificationContent: {
    display: 'flex',
    gap: '12px',
    flex: 1,
  },
  icon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  message: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  actionButton: {
    marginTop: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '12px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
};

// Helper functions for common notifications
export const notifySuccess = (
  addNotification: NotificationContextType['addNotification'],
  title: string,
  message: string,
  action?: Notification['action']
) => {
  addNotification({
    type: NotificationType.SUCCESS,
    title,
    message,
    action,
  });
};

export const notifyError = (
  addNotification: NotificationContextType['addNotification'],
  title: string,
  message: string
) => {
  addNotification({
    type: NotificationType.ERROR,
    title,
    message,
    duration: 7000,
  });
};

export const notifyInfo = (
  addNotification: NotificationContextType['addNotification'],
  title: string,
  message: string,
  action?: Notification['action']
) => {
  addNotification({
    type: NotificationType.INFO,
    title,
    message,
    action,
  });
};

export const notifyWarning = (
  addNotification: NotificationContextType['addNotification'],
  title: string,
  message: string
) => {
  addNotification({
    type: NotificationType.WARNING,
    title,
    message,
  });
};

// Transaction-specific notifications
export const notifyPurchaseConfirmed = (
  addNotification: NotificationContextType['addNotification'],
  productName: string,
  txSignature: string
) => {
  notifySuccess(
    addNotification,
    'Purchase Confirmed!',
    `Your purchase of "${productName}" has been confirmed.`,
    {
      label: 'View Transaction',
      onClick: () => window.open(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`, '_blank'),
    }
  );
};

export const notifyOrderShipped = (
  addNotification: NotificationContextType['addNotification'],
  productName: string,
  orderId: string
) => {
  notifyInfo(
    addNotification,
    'Order Shipped! 📦',
    `Your order "${productName}" has been shipped.`,
    {
      label: 'Track Order',
      onClick: () => window.location.href = `/orders/${orderId}`,
    }
  );
};

export const notifyDeliveryConfirmed = (
  addNotification: NotificationContextType['addNotification'],
  productName: string
) => {
  notifySuccess(
    addNotification,
    'Delivery Confirmed! 🎉',
    `"${productName}" has been delivered. Would you like to leave a reputation card?`
  );
};

export const notifyReputationCardReceived = (
  addNotification: NotificationContextType['addNotification'],
  issuerName: string,
  cardType: string,
  rating: number
) => {
  notifySuccess(
    addNotification,
    'New Reputation Card! 🌟',
    `${issuerName} left you a ${cardType} card with ${rating} stars.`,
    {
      label: 'View Profile',
      onClick: () => window.location.href = '/profile',
    }
  );
};

export const notifyReputationCardCreated = (
  addNotification: NotificationContextType['addNotification'],
  recipientName: string,
  txSignature: string
) => {
  notifySuccess(
    addNotification,
    'Reputation Card Created! ✨',
    `Your reputation card for ${recipientName} has been created on-chain.`,
    {
      label: 'View Transaction',
      onClick: () => window.open(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`, '_blank'),
    }
  );
};

export default NotificationProvider;
