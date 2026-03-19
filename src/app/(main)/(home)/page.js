'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import CategoriesAndBanner from '@/components/home/CategoriesAndBanner';
import VendorCTASimple from '@/components/home/vendorcta';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import TopRestaurants from '@/components/home/Toprestaurants';
import PopularRestaurants from '@/components/home/Popularrestaurants';
import { LocationProvider } from '@/contexts/LocationContext';
import { SignInModal } from '@/components/signin/SignInModal';

const Home = () => {
    const searchParams = useSearchParams();
    const router = useRouter();


    const [isSignInOpen, setIsSignInOpen] = useState(
        () => searchParams.get('sign-in') === 'true'
    );


    const handleCloseSignIn = () => {
        setIsSignInOpen(false);
        if (window.location.search.includes('sign-in')) {
            window.history.replaceState(null, '', '/');
        }
    };

    return (
        <LocationProvider>
            <div>
                <HeroSection />
                <CategoriesAndBanner />
                <FeaturedRestaurants />
                <TopRestaurants />
                <PopularRestaurants />
                <VendorCTASimple />
            </div>


            <SignInModal
                isOpen={isSignInOpen}
                onClose={handleCloseSignIn}
                onSignUpClick={() => {
                    handleCloseSignIn();
                    router.push('/register/customer');
                }}
                onForgotPasswordClick={() => {
                    handleCloseSignIn();
                    router.push('/forgot-password');
                }}
            />
        </LocationProvider>
    );
};

export default Home;