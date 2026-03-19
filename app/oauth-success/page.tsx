"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthSuccessContent() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const userStr = params.get("user");

        if (accessToken) {
            localStorage.setItem("access_token", accessToken);
        }

        if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
        }

        if (userStr) {
            const user = JSON.parse(decodeURIComponent(userStr));
            localStorage.setItem("currentUser", JSON.stringify(user));
        }

        if (accessToken) {
            router.replace("/");
        } else {
            router.replace("/login");
        }
    }, [params, router]);

    return <div>Đang chuyển về trang chủ...</div>;
}

export default function OAuthSuccess() {
    return (
        <Suspense fallback={<div>Đang chuyển về trang chủ...</div>}>
            <OAuthSuccessContent />
        </Suspense>
    );
}