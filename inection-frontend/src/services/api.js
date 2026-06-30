const API_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return await response.json();
};

export const getUsers = async () => {
    const response = await fetch(`${API_URL}/auth/users`);
    return await response.json();
};

export const searchUsers = async (query) => {
    const response = await fetch(`${API_URL}/auth/search?q=${query}`);
    return await response.json();
};

export const searchByInterest = async (interest) => {
    const response = await fetch(`${API_URL}/auth/search?interest=${interest}`);
    return await response.json();
};