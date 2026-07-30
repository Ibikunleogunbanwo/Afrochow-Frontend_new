'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesAndBanner from '@/components/home/CategoriesAndBanner';
import VendorCTASimple from '@/components/home/vendorcta';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import TopRestaurants from '@/components/home/Toprestaurants';
import PopularRestaurants from '@/components/home/Popularrestaurants';
import NotInYourAreaYet from '@/components/home/NotInYourAreaYet';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { useMarketStatus } from '@/hooks/useMarketStatus';

// Location search is now in the navbar (Header.jsx) and writes to LocationContext.
// All three section components read city + coordinates from LocationContext directly.

const Home = () => {
    const { served, checking, city } = useMarketStatus();

    // While the market check is still running, render the normal sections —
    // each already has its own loading skeleton, so there's no blank flash.
    // Only swap to the honest empty state once we've confirmed Afrochow
    // genuinely has no vendors near this user (not just "still loading").
    const showUnservedState = !checking && !served;

    return (
        <AuthModalProvider>
            <div>
                <HeroSection />
                <CategoriesAndBanner />
                {showUnservedState ? (
                    <NotInYourAreaYet city={city} />
                ) : (
                    <>
                        <FeaturedRestaurants />
                        <TopRestaurants />
                        <PopularRestaurants />
                    </>
                )}
                <VendorCTASimple />
            </div>
        </AuthModalProvider>
    );
};

export default Home;