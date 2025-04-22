import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AITitleHeader from '@/components/AITitleHeader';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'About',
        href: '/about',
    },
];

export default function About() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="About Us" />
            <AITitleHeader />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-16">
                    {/* Our Story Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div className="space-y-4">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Founded in 2022, our journey began with a simple vision: to make advanced AI technologies accessible to everyone. 
                                    What started as a small team of passionate engineers and data scientists has grown into a global community 
                                    dedicated to pushing the boundaries of what AI can accomplish.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Our flagship AI Title Generator was born from the realization that content creators spend hours crafting 
                                    the perfect headline. We leveraged cutting-edge natural language processing to create an intelligent system 
                                    that understands context, audience preferences, and engagement patterns.
                                </p>
                            </div>
                            <div className="rounded-lg overflow-hidden shadow-xl">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-64 flex items-center justify-center">
                                    <span className="text-white text-xl font-medium">Company Image</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Mission Section */}
                    <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
                            We're on a mission to democratize artificial intelligence and empower creators around the world 
                            to produce more engaging, effective content through intelligent automation.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                                <p className="text-gray-600 dark:text-gray-300">Continuously pushing the boundaries of what's possible with AI and machine learning.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                                <p className="text-gray-600 dark:text-gray-300">Making advanced AI tools approachable and usable for everyone, regardless of technical expertise.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ethical AI</h3>
                                <p className="text-gray-600 dark:text-gray-300">Maintaining the highest standards of data privacy and promoting responsible AI development.</p>
                            </div>
                        </div>
                    </section>

                    {/* Team Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Team</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-10 max-w-3xl">
                            Behind our technology is a diverse team of engineers, data scientists, designers, and content experts 
                            united by a passion for building intelligent systems that solve real problems.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    name: 'Sarah Johnson',
                                    title: 'CEO & Co-Founder',
                                    bio: 'Former AI Research Lead at Google with 15+ years in machine learning and NLP.'
                                },
                                {
                                    name: 'Michael Chen',
                                    title: 'CTO & Co-Founder',
                                    bio: 'Computer scientist specialized in neural networks and deep learning architectures.'
                                },
                                {
                                    name: 'Aisha Patel',
                                    title: 'Head of Product',
                                    bio: 'Product strategist focused on creating intuitive user experiences for complex technologies.'
                                },
                                {
                                    name: 'James Wilson',
                                    title: 'Lead Engineer',
                                    bio: 'Full-stack engineer with expertise in scalable AI systems and cloud infrastructure.'
                                }
                            ].map((member, index) => (
                                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-48 flex items-center justify-center">
                                        <span className="text-white">Team Member Photo</span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 mb-3">{member.title}</p>
                                        <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}