"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function StepIndicator({
                                        currentStep = 1,
                                        totalSteps = 6,
                                        stepLabels = [
                                          'Account',
                                          'Profile',
                                          'Restaurant',
                                          'Business',
                                          'Hours',
                                          'Address'
                                        ]
                                      }) {
  const router = useRouter();
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleStepClick = (stepNumber) => {
    // Don't navigate to current step
    if (stepNumber === currentStep) return;

    // Only allow navigation to previous (completed) steps
    if (stepNumber > currentStep) return;

    // Map step numbers to routes
    const stepRoutes = {
      1: '/register/vendor/step-1',
      2: '/register/vendor/step-2',
      3: '/register/vendor/step-3',
      4: '/register/vendor/step-4',
      5: '/register/vendor/step-5',
      6: '/register/vendor/step-6',
    };

    const route = stepRoutes[stepNumber];
    if (route) {
      router.push(route);
    }
  };

  return (
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const isFuture = stepNumber > currentStep;
              const isClickable = isCompleted;
              const label = stepLabels[index] || `Step ${stepNumber}`;

              return (
                  <div
                      key={stepNumber}
                      onClick={() => handleStepClick(stepNumber)}
                      className="relative group"
                  >
                    {/* Step Circle - Afrochow Theme */}
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                            isActive
                                ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white scale-110 ring-2 ring-orange-300 ring-offset-2 shadow-lg'
                                : isCompleted
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-400'
                        } ${
                            isClickable
                                ? 'cursor-pointer hover:scale-125 hover:shadow-xl active:scale-105 hover:ring-2 hover:ring-green-300 hover:ring-offset-1'
                                : isActive
                                    ? 'cursor-default'
                                    : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                      {isCompleted ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          stepNumber
                      )}
                    </div>

                    {/* Tooltip - Afrochow Theme */}
                    <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      <div className={`text-xs px-2.5 py-1.5 rounded shadow-lg font-medium ${
                          isActive
                              ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white'
                              : isCompleted
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isActive && '🔒 '}
                        {isCompleted && '✓ '}
                        {isFuture && '🔒 '}
                        {label}
                        {isClickable && ' (Click to edit)'}
                        {isFuture && ' (Complete current step first)'}
                      </div>
                      {/* Tooltip arrow */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 ${
                          isActive
                              ? 'bg-orange-600'
                              : isCompleted
                                  ? 'bg-gray-900'
                                  : 'bg-gray-200'
                      }`} />
                    </div>

                    {/* Connector Line (except for last step) */}
                    {stepNumber < totalSteps && (
                        <div className={`absolute top-1/2 left-full w-2 h-0.5 transition-colors duration-300 ${
                            isCompleted ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
              );
            })}
          </div>
          <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600 font-semibold">
            Step {currentStep} of {totalSteps}
          </span>
            <span className="text-xs text-gray-400">
            {stepLabels[currentStep - 1]}
          </span>
          </div>
        </div>

        {/* Progress Bar - Afrochow Theme */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
          <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Progress Percentage - Afrochow Theme */}
        <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {currentStep > 1 && '← Click previous steps to edit'}
        </span>
          <span className="text-xs font-medium text-orange-600">
          {Math.round(progressPercentage)}% Complete
        </span>
        </div>
      </div>
  );
}