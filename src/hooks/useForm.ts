import api from "@/lib/axios";
import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useFormRequest<T>() {
    const base_url = 'http://starpick-server.test/api/v1';
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Error | null>(null);

    const post = async <T = any>(url: string, data: any) => {
        setLoading(true);
        try {
            const response = await api.post<T>(url, data);
            return response.data;
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setErrors(err.response?.data || err.message);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const patch = async (url: string, data: any) => {
        fetch(base_url + url, {
            method: "patch",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then((res) => res.json())
            .then((res) => {
                setData(res);
                return res as T;
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setErrors(err);
                }
                return err;
            })
            .finally(() => {
                setLoading(false);
            });

    };

    return { post, patch, loading, errors, data, setErrors }
};