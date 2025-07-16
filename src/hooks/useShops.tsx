import { getAllShops } from "@/utils/serverActions/Shop";
import { useEffect, useState } from "react";

export const useShops = () => {
    const [shops, setShops] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchShops = async () => {
        setIsLoading(true);
        try {
            const response = await getAllShops();
            if (response?.data) {
                setShops(response.data);
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    return { shops, isLoading, error, refetch: fetchShops };
};
