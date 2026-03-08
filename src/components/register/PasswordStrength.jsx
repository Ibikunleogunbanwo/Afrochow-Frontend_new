
export const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 33, text: "Weak", color: "bg-red-500" };
    if (strength <= 3)
        return { level: 66, text: "Medium", color: "bg-amber-500" };
    return { level: 100, text: "Strong", color: "bg-green-500" };
};
