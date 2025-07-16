import { getAdminSettings } from "@/utils/serverActions/AdminSetting";
import { useEffect, useState } from "react";

export const useAdminSettings = () => {
    const [adminSettings, setAdminSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchAdminSettings = async () => {
        setIsLoading(true);
        try {
            const response = await getAdminSettings();
            if (response?.data) {
                setAdminSettings(response.data);
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminSettings();
    }, []);

    return { adminSettings, isLoading, error, refetch: fetchAdminSettings };
};
