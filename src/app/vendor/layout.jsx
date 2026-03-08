import VendorDashboardLayout from '@/components/vendor/VendorDashboardLayout';

export const metadata = {
    title: 'Vendor Dashboard - Afrochow',
    description: 'Manage your restaurant on Afrochow',
};

export default function VendorLayout({ children }) {
    return <VendorDashboardLayout>{children}</VendorDashboardLayout>;
}