"use client"
export const checkToken = () => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
        return true;
    } else {
        return false;
    }
};