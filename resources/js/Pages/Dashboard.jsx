import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quick Links */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
                                <div className="space-y-4">
                                    <Link
                                        href={route('chat.index')}
                                        className="block p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Chat</p>
                                                <p className="text-sm text-gray-500">Start a conversation with other users</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('followups.create')}
                                        className="block p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Create Follow-up</p>
                                                <p className="text-sm text-gray-500">Schedule a new follow-up message</p>
                                            </div>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('followups.index')}
                                        className="block p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">View Follow-ups</p>
                                                <p className="text-sm text-gray-500">Manage your follow-up messages</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome, {auth.user.name}!</h3>
                                <p className="text-gray-600">
                                    This is your dashboard where you can manage your communications and follow-ups.
                                    Use the quick links to navigate to different sections of the application.
                                </p>
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-2">Getting Started:</h4>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Start a chat with other users</li>
                                        <li>Create follow-up reminders</li>
                                        <li>Manage your scheduled follow-ups</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
