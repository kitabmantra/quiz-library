"use client"
import { useGetUserFromToken } from '@/lib/hooks/tanstack-query/query-hook/user/use-get-user-from-token';
import { useUserStore } from '@/lib/store/useUserStore';
import { deleteClientCookie } from '@/lib/utils/client-cookies';
import React, { useEffect, useMemo } from 'react'

function UserStoreWrapper({ children }: { children: React.ReactNode }) {
    const { data, isLoading } = useGetUserFromToken();
    const { setUser, user } = useUserStore();
    const shouldUpdateUser = useMemo(() => {
        if (!data || data.error) return false;
        if (!user || user.id !== data.user.id || user.admin !== data.user.admin) return true;
        return false;
    }, [data, user]);



    useEffect(() => {
        if (isLoading) return;
        if (shouldUpdateUser) {
            setUser(data.user);
        } else if (data?.error) {
            setUser(undefined);
            deleteClientCookie("user_token");
        }
    }, [isLoading, shouldUpdateUser, data, setUser]);

    return (
        <>
            {children}
        </>
    )
}

export default UserStoreWrapper
