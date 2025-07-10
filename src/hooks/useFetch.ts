import api from "@/lib/axios";
import { getCookie } from "@/lib/cookie";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFetchOptions {
	autoInvoke?: boolean;
	params?: Record<string, any>;
	headers?: Record<string, any>;
}

export function useFetch<T>(
	url: string,
	{ autoInvoke = true, ...options }: UseFetchOptions = {}
) {

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const controller = useRef<AbortController | null>(null);

	const refetch = useCallback(() => {
		if (!url) {
			return;
		}
		if (controller.current) {
			controller.current.abort();
		}
		controller.current = new AbortController();
		const token = getCookie("_token");
		setLoading(true);
		return api
			.get<T>(url, {
				signal: controller.current.signal,
				headers: {
					"Authorization": `Bearer ${token}`,
					...options.headers,
				},
				params: options.params,
			})
			.then((res) => {
				setData(res.data);
				return res.data;
			})
			.catch((err) => {
				if (axios.isCancel(err)) return;
				setError(err);
				if (err?.response?.status === 401) {
					return err;
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, [url]);

	const abort = useCallback(() => {
		if (controller.current) {
			controller.current.abort("");
		}
	}, []);

	useEffect(() => {
		if (autoInvoke) {
			refetch();
		}

		return () => {
			if (controller.current) {
				controller.current.abort("");
			}
		};
	}, [refetch, autoInvoke]);

	return { data, loading, error, refetch, abort };
}
