import { createContext, useState, useContext } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);

    const updateProfile = (data) => {
        setProfile((prev) => ({ ...prev, ...data }));
    };

    return (
        <UserContext.Provider value={{ profile, setProfile, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);