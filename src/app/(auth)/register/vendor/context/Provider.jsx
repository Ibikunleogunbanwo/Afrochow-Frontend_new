"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";
import reducer from "./reducer";
import initialState, { STATE_VERSION } from "./initialState";
import { logger } from "@/lib/utils/logger";
import { getStorageUsage } from "@/lib/utils/storageMonitor";
import { saveFiles, loadFiles, clearFiles } from "@/lib/utils/fileStorage";

const FormContext = createContext({
  state: initialState,
  dispatch: () => {},
  storageError: null,
});

// Keys for localStorage
const FORM_STATE_KEY = 'vendor_registration_form_state';

export function FormProvider({ children }) {
  // Initialize state without localStorage access during SSR
  const [state, dispatch] = useReducer(reducer, initialState);
  const [storageError, setStorageError] = useState(null);

  // Keep File objects in memory (separate from localStorage)
  const [fileObjects, setFileObjects] = useState({
    profileImageFile: null,
    businessLicense: null,
    logoFile: null,
    bannerFile: null,
  });

  // Load from localStorage AFTER component mounts (client-side only)
  useEffect(() => {
    logger.log('FormProvider: Client-side mount, loading from localStorage');

    async function loadData() {
      try {
        const savedState = localStorage.getItem(FORM_STATE_KEY);

        if (savedState) {
          const parsedState = JSON.parse(savedState);

          // Version check - clear old data if version mismatch
          if (parsedState._version !== STATE_VERSION) {
            logger.warn(
              `State version mismatch (saved: ${parsedState._version}, current: ${STATE_VERSION}). Clearing old data.`
            );
            localStorage.removeItem(FORM_STATE_KEY);
            clearFiles();
            return;
          }

          logger.log('FormProvider: Loaded form state from localStorage');

          // Hydrate with saved state (will be merged with fileObjects)
          dispatch({
            type: "HYDRATE",
            payload: { ...initialState, ...parsedState }
          });
        }

        // Load File objects from sessionStorage
        const savedFiles = await loadFiles();
        if (savedFiles) {
          logger.log('FormProvider: Loaded files from sessionStorage');
          setFileObjects(savedFiles);
        }
      } catch (error) {
        logger.error('FormProvider: Error loading from localStorage:', error);
        // Clear corrupted data
        if (typeof window !== 'undefined') {
          localStorage.removeItem(FORM_STATE_KEY);
          clearFiles();
        }
      }
    }

    loadData();
  }, []);

  // Save File objects to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Save files asynchronously
    saveFiles(fileObjects).catch(error => {
      logger.error('FormProvider: Error saving files:', error);
    });
  }, [fileObjects]);

  // Save state to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Exclude File objects and preview fields (can't be serialized / not needed)
      const {
        profileImageFile,
        businessLicense,
        logoFile,
        bannerFile,
        profileImagePreview,
        businessLicensePreview,
        logoPreview,
        bannerPreview,
        ...formData
      } = state;

      // Check storage before saving
      const usage = getStorageUsage();
      const dataSize = JSON.stringify(formData).length;

      if (parseFloat(usage.percentUsed) > 90) {
        logger.warn(`localStorage usage critical: ${usage.percentUsed}% (${usage.usedMB}MB / ${usage.quotaMB}MB)`);
      }

      // Save form data to localStorage
      localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formData));

      // Clear any previous error
      setStorageError(null);
    } catch (error) {
      logger.error('FormProvider: Error saving to localStorage:', error);

      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        const usage = getStorageUsage();
        const errorMsg = `Storage quota exceeded (${usage.usedMB}MB used). Please clear some images or browser data.`;

        logger.error('localStorage quota exceeded:', usage);
        setStorageError({
          type: 'quota_exceeded',
          message: errorMsg,
          usage
        });

        // Show alert to user
        if (typeof window !== 'undefined') {
          alert(
            `⚠️ Storage Full\n\n` +
            `Your browser's storage is full (${usage.usedMB}MB / ${usage.quotaMB}MB used).\n\n` +
            `To continue:\n` +
            `1. Remove some uploaded images\n` +
            `2. Clear your browser data for this site\n` +
            `3. Try using a different browser\n\n` +
            `Your form data is still saved, but new changes cannot be stored.`
          );
        }
      }
    }
  }, [state]);

  // Enhanced dispatch that handles special actions and File objects
  const enhancedDispatch = useCallback((action) => {
    if (action.type === 'CLEAR_FORM') {
      // Clear all form data and images from localStorage
      if (typeof window !== 'undefined') {
        // Clear main form state
        localStorage.removeItem(FORM_STATE_KEY);
        // Clear files from sessionStorage
        clearFiles();

        logger.log('FormProvider: Cleared all form data');
      }

      // Clear file objects
      setFileObjects({
        profileImageFile: null,
        businessLicense: null,
        logoFile: null,
        bannerFile: null,
      });

      // Reset state to initial values
      dispatch({ type: 'RESET' });
    } else if (action.type === 'UPDATE' && action.payload) {
      // Extract File objects from payload
      const {
        profileImageFile,
        businessLicense,
        logoFile,
        bannerFile,
        ...otherData
      } = action.payload;

      // Update File objects separately if present in payload
      const newFileObjects = {};
      if (profileImageFile !== undefined) newFileObjects.profileImageFile = profileImageFile;
      if (businessLicense !== undefined) newFileObjects.businessLicense = businessLicense;
      if (logoFile !== undefined) newFileObjects.logoFile = logoFile;
      if (bannerFile !== undefined) newFileObjects.bannerFile = bannerFile;

      if (Object.keys(newFileObjects).length > 0) {
        setFileObjects(prev => ({ ...prev, ...newFileObjects }));
      }

      // Dispatch to reducer (without File objects)
      dispatch(action);
    } else if (action.type === 'RESET') {
      // Clear file objects on reset
      setFileObjects({
        profileImageFile: null,
        businessLicense: null,
        logoFile: null,
        bannerFile: null,
      });
      dispatch(action);
    } else {
      // Default: pass through to reducer
      dispatch(action);
    }
  }, []);

  // Merge state with file objects for the context value
  const mergedState = {
    ...state,
    ...fileObjects,
  };

  return (
      <FormContext.Provider value={{
        state: mergedState,
        dispatch: enhancedDispatch,
        storageError,
      }}>
        {children}
      </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }

  return context;
}