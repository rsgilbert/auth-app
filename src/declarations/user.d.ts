interface User {
    user_id: string;
    email: string;
    hashed_password: string;
    confirmation_code: string;
    confirmed: boolean;
    refresh_token: string;
}