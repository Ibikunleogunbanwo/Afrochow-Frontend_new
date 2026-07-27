const normalize = (value) => String(value ?? "").trim().toLowerCase();

const boolFlag = (value, fallback) => {
    if (value === undefined || value === null || value === "") return fallback;
    return ["1", "true", "yes", "on"].includes(normalize(value));
};

export const CUSTOMER_MODES = {
    LIVE: "live",
    WAITLIST: "waitlist",
};

export const MVP_FLAGS = {
    customerMode: normalize(process.env.NEXT_PUBLIC_CUSTOMER_MODE) || CUSTOMER_MODES.WAITLIST,
    vendorOnboardingEnabled: boolFlag(process.env.NEXT_PUBLIC_VENDOR_ONBOARDING_ENABLED, true),
    orderingEnabled: boolFlag(process.env.NEXT_PUBLIC_ORDERING_ENABLED, false),
    showroomEnabled: boolFlag(process.env.NEXT_PUBLIC_SHOWROOM_ENABLED, true),
    waitlistFormUrl: process.env.NEXT_PUBLIC_WAITLIST_FORM_URL || "",
};

export const customerWaitlistPath = "/waitlist";
export const isCustomerWaitlistMode = MVP_FLAGS.customerMode !== CUSTOMER_MODES.LIVE;
export const isOrderingEnabled = MVP_FLAGS.orderingEnabled && !isCustomerWaitlistMode;
export const isVendorOnboardingEnabled = MVP_FLAGS.vendorOnboardingEnabled;

export const customerWaitlistMessage =
    "Afrochow ordering is opening soon. Join the waitlist and we will let you know when customer accounts go live.";
