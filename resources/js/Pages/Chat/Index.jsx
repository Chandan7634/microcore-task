import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dropdown } from '@/Components/Dropdown';
import { FiEdit2, FiTrash2, FiMoreVertical, FiCheck, FiBell } from 'react-icons/fi';
import { format } from 'date-fns';
import InputError from '@/Components/InputError';

const ChatMessage = ({ chat, auth, onEdit, onDeleteForMe, onDeleteForEveryone, onFollowUp, isEditing, editingMessage, setEditingMessage, saveEdit }) => {
    const isOwner = chat.sender_id === auth.user.id;
    const [localMessage, setLocalMessage] = useState(editingMessage?.message || '');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingMessage?.id === chat.id) {
            setLocalMessage(editingMessage.message);
        }
    }, [editingMessage, chat.id]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            setEditingMessage(null);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        onEdit(chat);
    };

    const handleDeleteForMe = (e) => {
        e.preventDefault();
        onDeleteForMe(chat.id);
    };

    const handleDeleteForEveryone = (e) => {
        e.preventDefault();
        onDeleteForEveryone(chat.id);
    };

    const handleFollowUp = (e) => {
        e.preventDefault();
        onFollowUp(chat);
    };

    return (
        <div className={`flex ${isOwner ? 'justify-end' : 'justify-start'} group`}>
            <div
                className={`max-w-[70%] rounded-lg p-3 relative ${isOwner ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
            >
                {isEditing && editingMessage?.id === chat.id ? (
                    <div className="flex flex-col space-y-2">
                        <textarea
                            value={localMessage}
                            onChange={(e) => {
                                setLocalMessage(e.target.value);
                                setEditingMessage({
                                    ...editingMessage,
                                    message: e.target.value
                                });
                            }}
                            onKeyDown={handleKeyDown}
                            className="rounded border-gray-300 text-gray-900 w-full min-h-[60px] p-2 resize-none"
                            placeholder="Edit your message..."
                            autoFocus
                        />
                        <InputError message={errors.message} className="mt-2" />
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={saveEdit}
                                    disabled={!localMessage.trim()}
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiCheck className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingMessage(null);
                                        setErrors({});
                                    }}
                                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                            <span className="text-xs text-gray-500">
                                Press Enter to save, Esc to cancel
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium mb-1">
                                {isOwner ? 'You' : chat.sender?.name}
                            </p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className={`p-1 rounded-full hover:bg-${isOwner ? 'blue-600' : 'gray-200'} transition`}
                                        >
                                            <FiMoreVertical className={`w-4 h-4 ${isOwner ? 'text-white' : 'text-gray-600'}`} />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        {!isOwner && (
                                            <button
                                                type="button"
                                                onClick={() => onFollowUp(chat)}
                                                className="w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center space-x-2"
                                            >
                                                <FiBell className="w-4 h-4" />
                                                <span>Set Follow-up</span>
                                            </button>
                                        )}
                                        {isOwner && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleEditClick}
                                                    className="w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center space-x-2"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteForEveryone}
                                                    className="w-full px-4 py-2 text-left text-sm leading-5 text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center space-x-2"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                    <span>Delete for Everyone</span>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleDeleteForMe}
                                            className="w-full px-4 py-2 text-left text-sm leading-5 text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                            <span>Delete for Me</span>
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                        <p className="mb-1 break-words">{chat.message}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                            <div className={isOwner ? 'text-blue-100' : 'text-gray-500'}>
                                <span>{format(new Date(chat.created_at), 'HH:mm')}</span>
                                {chat.is_edited && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span>edited {format(new Date(chat.updated_at), 'HH:mm')}</span>
                                    </>
                                )}
                            </div>
                            {!chat.is_read && chat.receiver_id === auth.user.id && (
                                <span className="text-yellow-500 font-medium">New</span>
                            )}
                        </div>
                    </>
                )}
            </div>
            <InputError message={errors.follow_up_at} className="mt-2" />
        </div>
    );
};

export default function Index({ auth, users, chats: initialChats }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [chats, setChats] = useState(initialChats);
    const messagesEndRef = useRef(null);
    const [errors, setErrors] = useState({});

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setChats(initialChats);
    }, [initialChats]);

    useEffect(() => {
        scrollToBottom();
        const interval = setInterval(() => {
            if (selectedUser) {
                router.reload({ only: ['chats'] });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [chats, selectedUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser) return;

        router.post(route('chat.send'), {
            receiver_id: selectedUser.id,
            message: message.trim()
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setMessage('');
                router.reload({ only: ['chats'] });
            },
            onError: (errors) => {
                console.error('Error sending message:', errors);
            }
        });
    };

    const handleEdit = (chat) => {
        setEditingMessage({
            id: chat.id,
            message: chat.message
        });
    };

    const saveEdit = () => {
        if (!editingMessage || !editingMessage.message.trim()) return;

        router.put(route('chat.update', editingMessage.id),
            { message: editingMessage.message.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingMessage(null);
                    router.reload({ only: ['chats'] });
                },
                onError: () => {
                    // Handle error if needed
                }
            }
        );
    };

    const deleteForMe = async (chatId) => {
        try {
            await router.delete(route('chat.deleteForMe', chatId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const deleteForEveryone = async (chatId) => {
        try {
            await router.delete(route('chat.deleteForEveryone', chatId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const markAsRead = async (chatId) => {
        try {
            await router.post(route('chat.markAsRead', chatId));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);

        if (chats.some(chat =>
            chat.sender_id === user.id &&
            chat.receiver_id === auth.user.id &&
            !chat.is_read
        )) {
            const scrollPosition = window.scrollY;
            router.post(route('chat.markAllAsRead'), {
                sender_id: user.id
            }, {
                preserveScroll: true,
                preserveState: true,
                only: ['chats'],
                onSuccess: () => {
                    window.scrollTo(0, scrollPosition);
                }
            });
        }
    };

    const createFollowUp = async (chat) => {
        const followUpDate = new Date();
        followUpDate.setHours(followUpDate.getHours() + 24);

        router.post(route('follow-ups.store'), {
            chat_id: chat.id,
            follow_up_at: followUpDate.toISOString()
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setErrors({});
                router.visit(route('follow-ups.index'));
            },
            onError: (errors) => {
                setErrors(errors);
            }
        });
    };

    const filteredChats = selectedUser
        ? chats.filter(chat =>
            (chat.sender_id === selectedUser.id && chat.receiver_id === auth.user.id) ||
            (chat.sender_id === auth.user.id && chat.receiver_id === selectedUser.id)
        ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}
        >
            <Head title="Chat" />

            <div className="py-12 fixed inset-0 mt-16">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 h-full">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg h-full">
                        <div className="p-6 text-gray-900 h-full">
                            <div className="flex h-full">
                                {/* Users List */}
                                <div className="w-1/4 border-r overflow-y-auto">
                                    <h3 className="text-lg font-medium mb-4 px-4 sticky top-0 bg-white">Users</h3>
                                    <div className="space-y-1">
                                        {users.map((user) => {
                                            const unreadCount = chats.filter(
                                                chat => chat.sender_id === user.id &&
                                                    chat.receiver_id === auth.user.id &&
                                                    !chat.is_read
                                            ).length;

                                            return (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleUserSelect(user)}
                                                    className={`w-full text-left px-4 py-3 flex justify-between items-center transition ${selectedUser?.id === user.id
                                                        ? 'bg-blue-50 border-l-4 border-blue-500'
                                                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                        }`}
                                                >
                                                    <span className="font-medium">{user.name}</span>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 flex flex-col h-full">
                                    {selectedUser ? (
                                        <>
                                            <div className="p-4 bg-white border-b sticky top-0">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {selectedUser.name}
                                                </h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                {filteredChats.map((chat) => (
                                                    <ChatMessage
                                                        key={chat.id}
                                                        chat={chat}
                                                        auth={auth}
                                                        onEdit={handleEdit}
                                                        onDeleteForMe={deleteForMe}
                                                        onDeleteForEveryone={deleteForEveryone}
                                                        onFollowUp={createFollowUp}
                                                        isEditing={!!editingMessage && editingMessage.id === chat.id}
                                                        editingMessage={editingMessage}
                                                        setEditingMessage={setEditingMessage}
                                                        saveEdit={saveEdit}
                                                    />
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                            <div className="p-4 bg-white border-t">
                                                <form onSubmit={sendMessage} className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={message}
                                                        onChange={(e) => setMessage(e.target.value)}
                                                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                        placeholder="Type your message..."
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!message.trim()}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Send
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-gray-500">
                                            <p>Select a user to start chatting</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 