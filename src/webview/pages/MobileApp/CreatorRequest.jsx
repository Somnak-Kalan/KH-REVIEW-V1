import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CreatorRequest from "../../../components/webview/MobileApp/creatorRequest/CreatorRequest";
import { useAppUserStore } from '../../../Stores/MobilesApp/User/user.store';
import { AuthContext } from '../../../contexts/AuthContext';

export default function CreatorRequestPage() {
    const location = useLocation();

    const fetchAppUserById = useAppUserStore((state) => state.fetchAppUserById);
    const user = useAppUserStore((state) => state.user);
    const loading = useAppUserStore((state) => state.loading);
    const error = useAppUserStore((state) => state.error);

    const { access_token } = useContext(AuthContext);

    const [appConfig, setAppConfig] = useState(() => {
        if (typeof window !== "undefined" && window.APP_CONFIG) {
            return window.APP_CONFIG;
        }
        return {};
    });

    useEffect(() => {
        const syncAppConfig = () => {
            if (typeof window !== "undefined" && window.APP_CONFIG) {
                setAppConfig(window.APP_CONFIG || {});
            }
        };

        syncAppConfig();
        window.addEventListener("app-config-ready", syncAppConfig);

        return () => {
            window.removeEventListener("app-config-ready", syncAppConfig);
        };
    }, []);

    const queryData = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            label: params.get("label") || "",
            value: params.get("value") || "",
            userId: params.get("user_id") || "",
            language: params.get("language") || "",
            theme: params.get("theme_mode") || "",
        };
    }, [location.search]);

    const finalLanguage = appConfig?.language || queryData.language || "en";
    const finalTheme = appConfig?.theme || queryData.theme || "light";
    const finalUserId = appConfig?.userId || queryData.value || queryData.userId || "";

    useEffect(() => {


        if (!access_token || !finalUserId) return;

        fetchAppUserById({
            access_token,
            _id: finalUserId,
            force: true
        });
    }, [access_token, finalUserId, fetchAppUserById, queryData.userId, queryData.value, appConfig?.userId, finalLanguage, finalTheme]);

    return (
        <CreatorRequest
            user={user}
            loading={loading}
            label={queryData.label}
            userId={finalUserId}
            initialPhone={user?.phone || ""}
            access_token={access_token}
            language={finalLanguage}
            theme={finalTheme}
        />
    );
}