import { useState, useEffect } from 'react';
import socket from '@/lib/socket';

export default function UpdateNotification() {
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        socket.on('dataUpdated', () => {
            setShowNotification(true);
        });

        return () => {
            socket.off('dataUpdated');
        };
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    if (!showNotification) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
            <p>データが更新されました。最新の情報を表示するには更新してください。</p>
            <button onClick={handleRefresh} className="mt-2 bg-white text-blue-500 px-4 py-2 rounded">
                更新する
            </button>
        </div>
    );
}