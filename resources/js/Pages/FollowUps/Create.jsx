import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { format, addHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export default function Create({ auth, users }) {
    // Set initial date to 24 hours from now in IST
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const initialDate = addHours(now, 24);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        message: '',
        follow_up_at: format(initialDate, "yyyy-MM-dd'T'HH:mm"),
    });

    const submit = (e) => {
        e.preventDefault();
        // Format the date in IST
        const localDate = new Date(data.follow_up_at);
        const formattedDate = formatInTimeZone(localDate, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");

        post(route('followups.store'), {
            ...data,
            follow_up_at: formattedDate,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                router.visit(route('followups.index'));
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Follow-up</h2>}
        >
            <Head title="Create Follow-up" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6" noValidate>
                                <div>
                                    <InputLabel htmlFor="user_id" value="Select User" className="required" />
                                    <select
                                        id="user_id"
                                        name="user_id"
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.user_id ? 'border-red-500' : 'border-gray-300'
                                            } focus:border-indigo-500 focus:ring-indigo-500`}
                                    >
                                        <option value="">Select a user</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <InputError message={errors.user_id} className="mt-2" />}
                                </div>

                                <div>
                                    <InputLabel htmlFor="message" value="Message" className="required" />
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={data.message}
                                        className={`mt-1 block w-full rounded-md shadow-sm ${errors.message ? 'border-red-500' : 'border-gray-300'
                                            } focus:border-indigo-500 focus:ring-indigo-500`}
                                        rows="4"
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Enter your follow-up message"
                                    />
                                    {errors.message && <InputError message={errors.message} className="mt-2" />}
                                </div>

                                <div>
                                    <InputLabel htmlFor="follow_up_at" value="Follow-up At (IST)" className="required" />
                                    <TextInput
                                        id="follow_up_at"
                                        type="datetime-local"
                                        name="follow_up_at"
                                        value={data.follow_up_at}
                                        className={`mt-1 block w-full ${errors.follow_up_at ? 'border-red-500' : ''}`}
                                        onChange={(e) => setData('follow_up_at', e.target.value)}
                                        min={format(now, "yyyy-MM-dd'T'HH:mm")}
                                    />
                                    {errors.follow_up_at && <InputError message={errors.follow_up_at} className="mt-2" />}
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <a
                                        href={route('followups.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 active:bg-gray-500 focus:outline-none focus:border-gray-500 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancel
                                    </a>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Follow-up'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 