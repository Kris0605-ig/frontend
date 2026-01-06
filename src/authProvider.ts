import { AuthProvider } from "react-admin";
import axios from "axios";

interface LoginParams {
    username: string;
    password: string;
}

interface CheckParamsErr {
    status: number;
}

export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    login: async ({ username, password }: LoginParams) => {
        try {
            // Bước 1: Đăng nhập và lấy Token
            const response = await axios.post("http://localhost:8080/api/login", {
                email: username,
                password: password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });

            // DEBUG: log response to help identify where token is returned
            console.log('🔐 Login response:', response);

            // Hỗ trợ nhiều tên trường token phổ biến
            const possibleToken =
                response.data?.['jwt-token'] ||
                response.data?.token ||
                response.data?.accessToken ||
                response.data?.access_token ||
                response.data?.data?.token ||
                response.headers?.authorization ||
                response.headers?.Authorization;

            let token: string | null = null;
            if (typeof possibleToken === 'string') {
                // Nếu header Authorization là "Bearer ...", lấy phần token
                token = possibleToken.replace(/^Bearer\s+/i, '');
            }

            if (!token) {
                console.error('❌ No JWT token found in login response');
                return Promise.reject(new Error('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.'));
            }

            // Store the JWT token in local storage
            localStorage.setItem("jwt-token", token);
            localStorage.setItem("username", username);

            // =========================================================
            // BƯỚC CẬP NHẬT 1: Fetch user data to get cartId
            // =========================================================
            try {
                const userResponse = await axios.get(`http://localhost:8080/api/public/users/email/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Phải dùng token để lấy cartId, ngay cả trên public URL
                    },
                });

                const cartId = userResponse.data.cart?.cartId ?? userResponse.data.cartId ?? null;
                if (cartId) {
                    localStorage.setItem("cartId", cartId);
                }

                return Promise.resolve();

            } catch (error) {
                console.error('❌ Failed fetching user data after login:', error);
                // Xử lý lỗi nếu không fetch được cartId (Sai tài khoản hoặc mật khẩu)
                return Promise.reject(new Error("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại."));
            }

        } catch (error) {
            console.error('❌ Login request failed:', error);
            return Promise.reject(new Error("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại."));
        }
    },

    // called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem("jwt-token");
        localStorage.removeItem("username");
        localStorage.removeItem("cartId"); // Cập nhật: Xóa luôn cartId
        return Promise.resolve();
    },

    // called when the API returns an error
    checkError: ({ status }: CheckParamsErr) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem("jwt-token");
            localStorage.removeItem("username");
            return Promise.reject();
        }
        return Promise.resolve();
    },

    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        // Cập nhật: Bạn có thể muốn kiểm tra cả cartId ở đây nếu nó là bắt buộc
        return localStorage.getItem("jwt-token") ? Promise.resolve() : Promise.reject();
    },

    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => Promise.resolve(),
};