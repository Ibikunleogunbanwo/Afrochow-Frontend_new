"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminFormHeader from "@/components/register/admin/admin components/AdminFormHeader";
import PersonalInfoSection from "@/components/register/admin/admin sections/PersonalInfoSection";
import AccountSection from "@/components/register/admin/admin sections/AccountSection";
import ProfileImageSection from "@/components/register/admin/admin sections/ProfileImageSection";
import AdminConfigSection from "@/components/register/admin/admin sections/AdminConfigSection";
import PermissionsSection from "@/components/register/admin/admin sections/PermissionsSection";
import { ImageUploadAPI } from "@/lib/api/imageUpload";
import { AuthAPI } from "@/lib/api/auth";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;
const REDIRECT_DELAY_MS = 1500;

const INITIAL_FORM_STATE = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  profileImageFile: null,
  acceptTerms: false,
  department: "",
  accessLevel: "",
  canVerifyVendors: false,
  canManageUsers: false,
  canViewReports: false,
  canManagePayments: false,
  canManageCategories: false,
  canResolveDisputes: false,
};

export default function AdminRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error('Access Denied', 'You must be logged in as an admin to access this page');
      router.push('/login');
      return;
    }

    if (role !== 'admin') {
      toast.error('Access Denied', 'Only administrators can register new admin users');
      router.push('/');
      return;
    }

    setIsCheckingAuth(false);
  }, [isAuthenticated, role, authLoading, router]);

  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // -------------------------
  // EVENT HANDLERS
  // -------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleAccessLevelChange = (accessLevel, defaultPermissions) => {
    setFormData({
      ...formData,
      accessLevel: accessLevel,
      ...defaultPermissions,
    });
  };

  const handleBulkPermissionChange = (newPermissions) => {
    setFormData({
      ...formData,
      ...newPermissions,
    });
  };

  // -------------------------
  // VALIDATION
  // -------------------------
  const validate = () => {
    const newErrors = {};

    // Personal info
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Other required fields
    if (!formData.profileImageFile) newErrors.profileImageFile = "Profile image is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.accessLevel) newErrors.accessLevel = "Access level is required";
    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // FORM SUBMISSION
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validate()) {
      toast.error("Validation Error", "Please fix the errors highlighted below");
      return;
    }

    setLoading(true);

    try {
      const imageResponse = await ImageUploadAPI.uploadRegistrationImage(
          formData.profileImageFile,
          'AdminProfileImage'
      );
      const profileImageUrl = imageResponse.imageUrl;

      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profileImageUrl,
        acceptTerms: formData.acceptTerms,
        department: formData.department,
        accessLevel: formData.accessLevel,
        canVerifyVendors: formData.canVerifyVendors,
        canManageUsers: formData.canManageUsers,
        canViewReports: formData.canViewReports,
        canManagePayments: formData.canManagePayments,
        canManageCategories: formData.canManageCategories,
        canResolveDisputes: formData.canResolveDisputes,
      };

      const data = await AuthAPI.registerAdmin(payload);

      if (!data.success) {
        toast.error("Registration Failed", data.message || "Please try again");
        setLoading(false);
        return;
      }

      toast.success(
          "Admin Registered Successfully!",
          `${formData.firstName} has been added as a ${formData.accessLevel}`
      );
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, REDIRECT_DELAY_MS);

    } catch (err) {
      toast.error(
          "Registration Error",
          err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">

          <AdminFormHeader onBack={() => window.history.back()} />

          <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl shadow-xl">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">

              {/* Form Sections */}
              <PersonalInfoSection
                  data={formData}
                  errors={errors}
                  onChange={handleChange}
              />

              <AccountSection
                  data={formData}
                  errors={errors}
                  onChange={handleChange}
              />

              <ProfileImageSection
                  data={formData}
                  errors={errors}
                  onChange={handleChange}
              />

              <AdminConfigSection
                  data={formData}
                  errors={errors}
                  onChange={handleChange}
                  onAccessLevelChange={handleAccessLevelChange}
              />

              <PermissionsSection
                  data={formData}
                  onChange={handleChange}
                  onBulkChange={handleBulkPermissionChange}
              />

              {/* Terms & Conditions */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input style={{ color: 'black', backgroundColor: 'white' }}
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-4 focus:ring-orange-100"
                  />
                  <div className="flex-1">
                  <span className="text-sm text-gray-700">
                    I accept the{" "}
                    <a href="/terms" className="text-orange-600 hover:text-orange-700 underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-orange-600 hover:text-orange-700 underline">
                      Privacy Policy
                    </a>
                    {" *"}
                  </span>
                    {errors.acceptTerms && (
                        <p className="text-sm text-red-600 mt-1">{errors.acceptTerms}</p>
                    )}
                  </div>
                </label>
              </section>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Admin Account...
                      </div>
                  ) : (
                      "Create Admin Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}