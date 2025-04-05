"use client";
import { useState, use, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MdEdit, MdSecurity, MdEmail, MdKey, MdLogout, MdDeleteForever, MdOutlineArrowBack, MdPersonAdd, MdChat, MdVerified, MdSupervisorAccount, MdAdminPanelSettings, MdCircle } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import DeleteAccountConfirmation from '@/app/components/DeleteAccountConfirmation';
import ChangePassword from '@/app/components/ChangePassword';
import ChangePasskey from '@/app/components/ChangePasskey';
import ChangeEmail from '@/app/components/ChangeEmail';
import ThemeToggle from '@/app/components/ThemeToggle';
import FriendList from '@/app/components/FriendList';
import Chat from '@/app/components/Chat';
import UserSearch from '@/app/components/UserSearch';
import Notifications from '@/app/components/Notifications';
import EnterNewUsername from '@/app/components/EnterNewUsername';
import UserList from '@/app/components/UserList';

interface SecuritySettings {
    is2faEnabled: boolean;
    lastPasswordChange: string;
    lastPasskeyChange: string;
}

interface UserData {
    photoUrl: string;
    role?: 'moderator' | 'admin';
    canAssignModerator?: boolean;
    username?: string;
    isOnline?: boolean;
}

export default function Profile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const router = useRouter();
    const [photoUrl, setPhotoUrl] = useState('/default-avatar.png');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        is2faEnabled: false,
        lastPasswordChange: '2024-01-01',
        lastPasskeyChange: '2024-01-01'
    });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangePasskey, setShowChangePasskey] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [userData, setUserData] = useState<UserData>({ photoUrl: '/default-avatar.png' });
    const [showChangeUsername, setShowChangeUsername] = useState(false);

    useEffect(() => {
        // Fetch user data including photo
        const fetchUserData = async () => {
            try {
                const currentUser = localStorage.getItem('username');
                const response = await fetch(`/api/profile/${username}`, {
                    headers: {
                        'x-user': currentUser || ''
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                setUserData(data);
                if (data.photoUrl) {
                    setPhotoUrl(data.photoUrl);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                router.push('/404'); // Redirect to 404 if profile not found
            }
        };

        fetchUserData();
    }, [username, router]);

    useEffect(() => {
        const currentUser = localStorage.getItem('username');
        // Restrict access to non-logged in users
        if (!currentUser) {
            router.replace('/auth');
            return;
        }
        setIsOwnProfile(currentUser === username);
        checkFriendStatus();
    }, [username, router]);

    const checkFriendStatus = async () => {
        try {
            const currentUser = localStorage.getItem('username');
            const res = await fetch(`/api/friends/check/${username}`, {
                headers: {
                    'x-user': currentUser || ''
                }
            });
            if (!res.ok) throw new Error('Failed to check friend status');
            const data = await res.json();
            setIsFriend(data.isFriend);
        } catch (error) {
            console.error('Failed to check friend status:', error);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('username', username);

            const response = await fetch('/api/profile/updatePhoto', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setPhotoUrl(data.photoUrl);
        } catch (error) {
            console.error('Failed to update photo:', error);
        }
    };

    const handleChange2FA = async () => {
        // Toggle 2FA implementation
    };

    const handleChangePassword = async () => {
        setShowChangePassword(true);
    };

    const handleChangePasskey = async () => {
        setShowChangePasskey(true);
    };

    const handleChangeEmail = async () => {
        setShowChangeEmail(true);
    };

    const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
        // Implement password change logic
        setShowChangePassword(false);
    };

    const handlePasskeyChange = async (oldPasskey: string, newPasskey: string) => {
        // Implement passkey change logic
        setShowChangePasskey(false);
    };

    const handleEmailChange = async (oldEmail: string, newEmail: string) => {
        // Implement email change logic
        setShowChangeEmail(false);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                localStorage.clear(); // Clear all local storage
                router.replace('/auth');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleDeleteAccount = async (feedback?: string) => {
        try {
            const response = await fetch(`/api/profile/${username}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback })
            });

            if (!response.ok) throw new Error('Failed to delete account');

            localStorage.removeItem('hasPasskey');
            router.push('/auth');
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const handleBackClick = () => {
        router.back();
    };

    const handleAddFriend = async () => {
        try {
            const currentUser = localStorage.getItem('username');
            if (!currentUser) {
                router.push('/auth');
                return;
            }

            const res = await fetch('/api/friends/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    friendUsername: username
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
            }

            alert('Friend request sent successfully!');
            checkFriendStatus(); // Refresh friend status

        } catch (error: any) {
            alert(error.message || 'Failed to send friend request');
        }
    };

    const handleAssignModerator = async () => {
        try {
            const response = await fetch('/api/profile/moderator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUsername: localStorage.getItem('username'),
                    targetUsername: username
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            // Refresh user data
            window.location.reload();
        } catch (error: any) {
            alert(error.message || 'Failed to assign moderator role');
        }
    };

    const handleDeleteUser = async () => {
        try {
            const currentUser = localStorage.getItem('username');
            const response = await fetch(`/api/profile/${username}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actorUsername: currentUser })
            });

            if (!response.ok) {
                throw new Error((await response.json()).message);
            }

            router.push('/');
        } catch (error: any) {
            alert(error.message || 'Failed to delete user');
        }
    };

    const handleChangeUsername = async (newUsername: string) => {
        try {
            const currentUser = localStorage.getItem('username');
            const response = await fetch(`/api/profile/${username}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newUsername,
                    actorUsername: currentUser
                })
            });

            if (!response.ok) {
                throw new Error((await response.json()).message);
            }

            window.location.reload();
        } catch (error: any) {
            alert(error.message || 'Failed to change username');
        }
    };

    const currentDate = new Date();
    const memberSince = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(currentDate);

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={handleBackClick}
                        className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700"
                    >
                        <MdOutlineArrowBack className="text-2xl text-white" />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <Link href="/">
                            <Image
                                src={isDark ? "/logo.png" : "/dark_logo.png"}
                                alt="Locamoo"
                                width={120}
                                height={40}
                                priority
                            />
                        </Link>
                        <UserSearch />
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Notifications />
                    </div>
                </div>

                {/* Add friend/chat buttons if not own profile */}
                {!isOwnProfile && (
                    <div className="mb-6 flex items-center gap-2">
                        {!isFriend && (
                            <button
                                onClick={handleAddFriend}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                <MdPersonAdd className="text-xl" />
                                Add Friend
                            </button>
                        )}
                        {isFriend && (
                            <button
                                onClick={() => setShowChat(true)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                <MdChat className="text-xl" />
                                Chat
                            </button>
                        )}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-gray-900 rounded-xl p-6 mb-8 flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div
                            className={`w-full h-full rounded-full overflow-hidden ${isOwnProfile ? 'cursor-pointer' : ''}`}
                            onClick={isOwnProfile ? handlePhotoClick : undefined}
                        >
                            <Image
                                src={photoUrl}
                                alt="Profile"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        {/* Add status indicator dot */}
                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${userData.isOnline ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                        {isOwnProfile && (
                            <button
                                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600"
                                onClick={handlePhotoClick}
                            >
                                <MdEdit className="text-white" />
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">{username}</h1>
                            <div className="flex items-center gap-2">
                                <MdCircle
                                    className={userData.isOnline ? "text-green-500" : "text-gray-500"}
                                    size={12}
                                />
                                <span className={`text-sm ${userData.isOnline ? "text-green-500" : "text-gray-500"}`}>
                                    {userData.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            {userData.username === 'yasin' ? (
                                <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-sm">
                                    <MdVerified />
                                    <span>Admin</span>
                                </div>
                            ) : userData.role === 'moderator' && (
                                <div className="flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg text-sm">
                                    <MdVerified />
                                    <span>Moderator</span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400">Member since {memberSince}</p>
                        {userData.canAssignModerator && !userData.role && (
                            <button
                                onClick={handleAssignModerator}
                                className="mt-2 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                                <MdVerified />
                                Assign as Moderator
                            </button>
                        )}
                    </div>
                </div>

                {/* Add moderator controls section independent of profile picture */}
                {(userData.role === 'admin' || userData.role === 'moderator') && !isOwnProfile && username !== 'yasin' && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            {userData.role === 'admin' ? (
                                <><MdAdminPanelSettings className="text-red-500" /> Admin Controls</>
                            ) : (
                                <><MdSupervisorAccount className="text-blue-500" /> Moderator Controls</>
                            )}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowChangeUsername(true)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Change Username
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                        handleDeleteUser();
                                    }
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {isOwnProfile && (
                    <div className="bg-gray-900 rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <MdSecurity className="text-2xl text-blue-500" />
                                    <div>
                                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-400">Add an extra layer of security</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleChange2FA}
                                    className={`px-4 py-2 rounded-lg ${securitySettings.is2faEnabled
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {securitySettings.is2faEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <MdKey className="text-2xl text-blue-500" />
                                    <div>
                                        <h3 className="text-white font-medium">Change Password</h3>
                                        <p className="text-sm text-gray-400">Last changed: {securitySettings.lastPasswordChange}</p>
                                    </div>
                                </div>
                                <MdEdit className="text-gray-400" />
                            </button>

                            <button
                                onClick={handleChangePasskey}
                                className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <MdKey className="text-2xl text-blue-500" />
                                    <div>
                                        <h3 className="text-white font-medium">Change Passkey</h3>
                                        <p className="text-sm text-gray-400">Last changed: {securitySettings.lastPasskeyChange}</p>
                                    </div>
                                </div>
                                <MdEdit className="text-gray-400" />
                            </button>

                            <button
                                onClick={handleChangeEmail}
                                className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <MdEmail className="text-2xl text-blue-500" />
                                    <div>
                                        <h3 className="text-white font-medium">Change Email</h3>
                                        <p className="text-sm text-gray-400">Current: user@example.com</p>
                                    </div>
                                </div>
                                <MdEdit className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Show friend list only on own profile */}
                {isOwnProfile && (
                    <div className="mt-6">
                        <FriendList username={username} />
                    </div>
                )}

                {/* Add UserList for admins and moderators */}
                {(userData.role === 'admin' || userData.role === 'moderator') && (
                    <div className="mt-6">
                        <UserList />
                    </div>
                )}

                {/* Account Actions */}
                {isOwnProfile && (
                    <div className="bg-gray-900 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Account Actions</h2>
                        <div className="space-y-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                            >
                                <div className="flex items-center gap-4">
                                    <MdLogout className="text-2xl text-yellow-500" />
                                    <div>
                                        <h3 className="font-medium">Logout</h3>
                                        <p className="text-sm text-gray-400">Sign out from your account</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-red-900/50 rounded-lg text-white"
                            >
                                <div className="flex items-center gap-4">
                                    <MdDeleteForever className="text-2xl text-red-500" />
                                    <div>
                                        <h3 className="font-medium text-red-500">Delete Account</h3>
                                        <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isOwnProfile && (
                <>
                    {showDeleteConfirmation && (
                        <DeleteAccountConfirmation
                            onConfirm={handleDeleteAccount}
                            onCancel={() => setShowDeleteConfirmation(false)}
                        />
                    )}

                    {showChangePassword && (
                        <ChangePassword
                            onClose={() => setShowChangePassword(false)}
                            onConfirm={handlePasswordChange}
                        />
                    )}

                    {showChangePasskey && (
                        <ChangePasskey
                            onClose={() => setShowChangePasskey(false)}
                            onConfirm={handlePasskeyChange}
                        />
                    )}

                    {showChangeEmail && (
                        <ChangeEmail
                            onClose={() => setShowChangeEmail(false)}
                            onConfirm={handleEmailChange}
                        />
                    )}
                </>
            )}

            {/* Add chat component */}
            {showChat && (
                <Chat
                    friend={username}
                    onClose={() => setShowChat(false)}
                />
            )}

            {showChangeUsername && (
                <EnterNewUsername
                    currentUsername={username}
                    onConfirm={(newUsername) => {
                        handleChangeUsername(newUsername);
                        setShowChangeUsername(false);
                    }}
                    onCancel={() => setShowChangeUsername(false)}
                />
            )}
        </div>
    );
}
