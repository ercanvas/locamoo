'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { MdNotifications } from 'react-icons/md';

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: string;
}

const NotificationsContext = createContext<{
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}>({
    notifications: [],
    addNotification: () => { },
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        const websocket = new WebSocket(WS_URL!);
        setWs(websocket);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NOTIFICATION') {
                addNotification({
                    message: getNotificationMessage(data),
                    type: 'info'
                });
            }
        };

        return () => websocket.close();
    }, []);

    const getNotificationMessage = (data: any) => {
        switch (data.notificationType) {
            case 'FRIEND_REQUEST':
                return `${data.from} sent you a friend request`;
            case 'FRIEND_ACCEPTED':
                return `${data.from} accepted your friend request`;
            default:
                return data.message || 'New notification';
        }
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [...prev, newNotification]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
    };

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`flex items-center gap-2 p-4 rounded-lg shadow-lg animate-slide-up
                            ${notification.type === 'success' ? 'bg-green-600' :
                                notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
                    >
                        <MdNotifications className="text-xl text-white" />
                        <p className="text-white">{notification.message}</p>
                    </div>
                ))}
            </div>
        </NotificationsContext.Provider>
    );
}
