import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import TitleGenerator from '@/components/TitleGenerator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Title Generator',
        href: '/title-generator',
    },
];

export default function TitleGeneratorPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Capstone Title Generator" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Capstone Title Generator
                    </h1>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                        Generate professional, engaging titles for your capstone project using AI. 
                        Simply describe your project, select a category, and add optional keywords.
                    </p>
                    <TitleGenerator />
                </div>
            </div>
        </AppLayout>
    );
}