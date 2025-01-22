import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string;
            username?: string;
            role?: 'free' | 'pro';
            subscriptionStatus?: 'none' | 'active' | 'cancelled';
        }
    }

    interface User {
        id: string;
        email?: string;
        username?: string;
        role?: 'free' | 'pro';
        subscriptionStatus?: 'none' | 'active' | 'cancelled';
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email?: string;
        username?: string;
        role?: 'free' | 'pro';
        subscriptionStatus?: 'none' | 'active' | 'cancelled';
    }
}