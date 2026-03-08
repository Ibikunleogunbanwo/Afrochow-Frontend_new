import { PERMISSION_KEYS } from "@/components/register/admin/utils/permissions";

/**
 * PERMISSION UTILITIES
 * Comprehensive helper functions for managing admin permissions
 */

// ============================================================================
// PERMISSION STATE MANAGEMENT
// ============================================================================

/**
 * Toggle all permissions to a specific state
 * @param {boolean} enabled - Whether to enable or disable all permissions
 * @returns {Object} Object with all permission keys set to the enabled value
 *
 * @example
 * const allEnabled = toggleAllPermissions(true);
 * // Returns: { canManageUsers: true, canManageVendors: true, ... }
 *
 * const allDisabled = toggleAllPermissions(false);
 * // Returns: { canManageUsers: false, canManageVendors: false, ... }
 */
export function toggleAllPermissions(enabled) {
    const updates = {};

    PERMISSION_KEYS.forEach((key) => {
        updates[key] = enabled;
    });

    return updates;
}

/**
 * Apply permissions based on access level
 * Different access levels have different default permissions
 *
 * @param {string} accessLevel - Access level (SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT)
 * @returns {Object} Object with permissions set according to access level
 *
 * @example
 * const adminPerms = applyAccessLevelPermissions('ADMIN');
 * // Returns: { canManageUsers: true, canManageVendors: true, canManagePayments: false, ... }
 */
export function applyAccessLevelPermissions(accessLevel) {
    const permissions = {};

    PERMISSION_KEYS.forEach((key) => {
        switch (accessLevel) {
            case "SUPER_ADMIN":
                permissions[key] = true;
                break;

            case "MANAGER":
                permissions[key] = ["canVerifyVendors", "canManageUsers"].includes(key);
                break;

            case "MODERATOR":
                permissions[key] = [ "canResolveDisputes"].includes(key);
                break;

            case "SUPPORT":
                permissions[key] = ["canResolveDisputes","canViewReports", "canViewOrders"].includes(key);
                break;

            default:
                permissions[key] = false;
        }
    });

    return permissions;
}

// ============================================================================
// PERMISSION EXTRACTION & VALIDATION
// ============================================================================

/**
 * Extract only permission-related fields from form data
 * Ensures all permissions are boolean values
 *
 * @param {Object} data - Form data containing permissions and other fields
 * @returns {Object} Object containing only permission keys with boolean values
 *
 * @example
 * const formData = {
 *   username: "admin",
 *   canManageUsers: true,
 *   canManageVendors: "true", // string
 *   canManageOrders: undefined,
 *   firstName: "John"
 * };
 *
 * const permissions = extractPermissions(formData);
 * // Returns: { canManageUsers: true, canManageVendors: true, canManageOrders: false }
 */
export function extractPermissions(data) {
    return PERMISSION_KEYS.reduce((acc, key) => {
        acc[key] = Boolean(data[key]);
        return acc;
    }, {});
}

/**
 * Validate that permission data has all required keys
 * @param {Object} data - Permission data to validate
 * @returns {boolean} True if all permission keys are present
 *
 * @example
 * const valid = validatePermissionStructure({ canManageUsers: true, canManageVendors: false });
 * // Returns: true if all PERMISSION_KEYS are present, false otherwise
 */
export function validatePermissionStructure(data) {
    return PERMISSION_KEYS.every((key) => key in data);
}

// ============================================================================
// PERMISSION COUNTING & CHECKING
// ============================================================================

/**
 * Count how many permissions are currently enabled
 * @param {Object} data - Form data or permissions object
 * @returns {number} Count of enabled permissions
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: false, canManageOrders: true };
 * const count = countEnabledPermissions(data);
 * // Returns: 2
 */
export function countEnabledPermissions(data) {
    return PERMISSION_KEYS.filter((key) => Boolean(data[key])).length;
}

/**
 * Check if all permissions are granted
 * @param {Object} data - Form data or permissions object
 * @returns {boolean} True if all permissions are enabled
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: true, canManageOrders: true };
 * const allGranted = areAllPermissionsGranted(data);
 * // Returns: true
 */
export function areAllPermissionsGranted(data) {
    return PERMISSION_KEYS.every((key) => Boolean(data[key]));
}

/**
 * Check if no permissions are granted
 * @param {Object} data - Form data or permissions object
 * @returns {boolean} True if no permissions are enabled
 *
 * @example
 * const data = { canManageUsers: false, canManageVendors: false };
 * const noneGranted = areNoPermissionsGranted(data);
 * // Returns: true
 */
export function areNoPermissionsGranted(data) {
    return PERMISSION_KEYS.every((key) => !Boolean(data[key]));
}

/**
 * Check if specific permission is granted
 * @param {Object} data - Form data or permissions object
 * @param {string} permission - Permission key to check
 * @returns {boolean} True if permission is enabled
 *
 * @example
 * const hasPermission = isPermissionGranted(data, 'canManageUsers');
 * // Returns: true or false
 */
export function isPermissionGranted(data, permission) {
    return Boolean(data[permission]);
}

// ============================================================================
// PERMISSION ANALYSIS & SUMMARIES
// ============================================================================

/**
 * Get a formatted summary of permission status
 * @param {Object} data - Form data or permissions object
 * @returns {Object} Summary object with counts and status
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: true, canManageOrders: false };
 * const summary = getPermissionsSummary(data);
 * // Returns: {
 * //   total: 3,
 * //   enabled: 2,
 * //   disabled: 1,
 * //   percentage: 66.67,
 * //   allGranted: false,
 * //   noneGranted: false
 * // }
 */
export function getPermissionsSummary(data) {
    const enabled = countEnabledPermissions(data);
    const total = PERMISSION_KEYS.length;
    const disabled = total - enabled;

    return {
        total,
        enabled,
        disabled,
        percentage: total > 0 ? Math.round((enabled / total) * 100 * 100) / 100 : 0,
        allGranted: enabled === total,
        noneGranted: enabled === 0,
    };
}

/**
 * Get list of granted permission keys
 * @param {Object} data - Form data or permissions object
 * @returns {string[]} Array of enabled permission keys
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: false, canManageOrders: true };
 * const granted = getGrantedPermissions(data);
 * // Returns: ['canManageUsers', 'canManageOrders']
 */
export function getGrantedPermissions(data) {
    return PERMISSION_KEYS.filter((key) => Boolean(data[key]));
}

/**
 * Get list of denied permission keys
 * @param {Object} data - Form data or permissions object
 * @returns {string[]} Array of disabled permission keys
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: false, canManageOrders: true };
 * const denied = getDeniedPermissions(data);
 * // Returns: ['canManageVendors']
 */
export function getDeniedPermissions(data) {
    return PERMISSION_KEYS.filter((key) => !Boolean(data[key]));
}

// ============================================================================
// PERMISSION COMPARISON
// ============================================================================

/**
 * Compare two permission sets and get differences
 * @param {Object} oldPermissions - Previous permission state
 * @param {Object} newPermissions - New permission state
 * @returns {Object} Object with added, removed, and unchanged permissions
 *
 * @example
 * const old = { canManageUsers: true, canManageVendors: false };
 * const new = { canManageUsers: true, canManageVendors: true };
 * const diff = comparePermissions(old, new);
 * // Returns: { added: ['canManageVendors'], removed: [], unchanged: ['canManageUsers'] }
 */
export function comparePermissions(oldPermissions, newPermissions) {
    const added = [];
    const removed = [];
    const unchanged = [];

    PERMISSION_KEYS.forEach((key) => {
        const hadPermission = Boolean(oldPermissions[key]);
        const hasPermission = Boolean(newPermissions[key]);

        if (!hadPermission && hasPermission) {
            added.push(key);
        } else if (hadPermission && !hasPermission) {
            removed.push(key);
        } else {
            unchanged.push(key);
        }
    });

    return { added, removed, unchanged };
}

// ============================================================================
// PERMISSION FORMATTING
// ============================================================================

/**
 * Format permission key to human-readable label
 * @param {string} permissionKey - Permission key (e.g., 'canManageUsers')
 * @returns {string} Formatted label (e.g., 'Manage Users')
 *
 * @example
 * const label = formatPermissionLabel('canManageUsers');
 * // Returns: 'Manage Users'
 */
export function formatPermissionLabel(permissionKey) {
    return permissionKey
        .replace(/^can/, "") // Remove 'can' prefix
        .replace(/([A-Z])/g, " $1") // Add space before capitals
        .trim(); // Remove leading space
}

/**
 * Get formatted list of granted permissions for display
 * @param {Object} data - Form data or permissions object
 * @returns {string[]} Array of formatted permission labels
 *
 * @example
 * const data = { canManageUsers: true, canManageVendors: true };
 * const labels = getGrantedPermissionLabels(data);
 * // Returns: ['Manage Users', 'Manage Vendors']
 */
export function getGrantedPermissionLabels(data) {
    return getGrantedPermissions(data).map(formatPermissionLabel);
}