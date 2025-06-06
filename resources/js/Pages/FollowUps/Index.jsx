import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { FiEdit2, FiTrash2, FiClock, FiUser, FiCheck } from 'react-icons/fi';

export default function Index({ auth, followUps }) {
    const [filter, setFilter] = useState('all');
    const timeZone = 'Asia/Kolkata';

    const filteredFollowUps = followUps.filter(followUp => {
        if (filter === 'pending') return !followUp.is_sent;
        if (filter === 'sent') return followUp.is_sent;
        return true;
    });

    const handleDelete = (followUp) => {
        if (confirm('Are you sure you want to delete this follow-up?')) {
            router.delete(route('followups.destroy', followUp.id));
        }
    };

    const formatDate = (dateString) => {
        try {
            return formatInTimeZone(parseISO(dateString), timeZone, 'PPp') + ' IST';
        } catch (error) {
            console.error('Date parsing error:', error);
            return dateString;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">My Follow-ups</h2>
                    <Link
                        href={route('followups.create')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Create Follow-up
                    </Link>
                </div>
            }
        >
            <Head title="Follow-ups" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Filter Buttons */}
                            <div className="mb-6 flex space-x-4">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg ${filter === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-4 py-2 rounded-lg ${filter === 'pending'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setFilter('sent')}
                                    className={`px-4 py-2 rounded-lg ${filter === 'sent'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    Sent
                                </button>
                            </div>

                            <div className="space-y-4">
                                {filteredFollowUps.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">No follow-ups found</p>
                                        <Link
                                            href={route('followups.create')}
                                            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Create your first follow-up
                                        </Link>
                                    </div>
                                ) : (
                                    filteredFollowUps.map(followUp => (
                                        <div
                                            key={followUp.id}
                                            className={`border rounded-lg p-6 ${followUp.is_sent ? 'bg-gray-50' : 'bg-white'
                                                } hover:shadow-md transition`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <FiUser className="w-4 h-4" />
                                                        <span>To: {followUp.user_name}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <FiClock className="w-4 h-4" />
                                                        <span>Scheduled for: {formatDate(followUp.follow_up_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${followUp.is_sent
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {followUp.is_sent ? (
                                                            <>
                                                                <FiCheck className="w-4 h-4 mr-1" />
                                                                Sent
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiClock className="w-4 h-4 mr-1" />
                                                                Pending
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-gray-700 whitespace-pre-wrap">{followUp.message}</p>
                                            </div>

                                            <div className="mt-4 flex justify-end space-x-3">
                                                {!followUp.is_sent && (
                                                    <Link
                                                        href={route('followups.edit', followUp.id)}
                                                        className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                                    >
                                                        <FiEdit2 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(followUp)}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                >
                                                    <FiTrash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
