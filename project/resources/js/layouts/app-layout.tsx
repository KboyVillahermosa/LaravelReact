import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ 
    children, 
    breadcrumbs, 
    className = "bg-white",
    ...props 
}: AppLayoutProps & { className?: string }) {
    return (
        <div className={`min-h-screen ${className}`}>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                <main>
                    {children}
                </main>
            </AppLayoutTemplate>
        </div>
    );
}
