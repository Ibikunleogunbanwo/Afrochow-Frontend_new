import AdminDashboardLayout from "@/components/admin/dashboard/AdminDashboardLayout";

export const metadata = {
    title: 'Admin Dashboard - Afrochow',
    description: 'Manage your users on Afrochow',
};

export default function AdminLayout({ children }) {
    return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}