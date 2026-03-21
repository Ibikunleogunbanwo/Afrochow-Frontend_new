"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { SignInModal } from "@/components/signin/SignInModal";
import { SignUpModal } from "@/components/register/SignUpModal";

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const openSignIn  = useCallback(() => { setShowSignUp(false); setShowSignIn(true);  }, []);
    const openSignUp  = useCallback(() => { setShowSignIn(false); setShowSignUp(true);  }, []);
    const closeAll    = useCallback(() => { setShowSignIn(false); setShowSignUp(false); }, []);

    return (
        <AuthModalContext.Provider value={{ openSignIn, openSignUp }}>
            {children}

            <SignInModal
                isOpen={showSignIn}
                onClose={closeAll}
                onSignUpClick={openSignUp}
            />

            <SignUpModal
                isOpen={showSignUp}
                onClose={closeAll}
                onSignInClick={openSignIn}
            />
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const ctx = useContext(AuthModalContext);
    if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
    return ctx;
};