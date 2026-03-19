"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";

export default function GoogleCallback() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const handleGoogleLogin = async () => {
            try {
                const query = params.toString();

                const res = await api.get(`/auths/google/callback?${query}`);

                const { accessToken, refreshToken } = res.data.data;

                localStorage.setItem("access_token", accessToken);
                localStorage.setItem("refresh_token", refreshToken);

                router.replace("/");
            } catch (err) {
                console.error("Google login error", err);
                router.replace("/login");
            }
        };

        handleGoogleLogin();
    }, []);

    return <div>Đang đăng nhập bằng Google...</div>;
}