import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contact',
        href: '/contact',
    },
];

export default function Contact() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contact Us" />
            {/* Contact form and content here */}
        </AppLayout>
    );
}