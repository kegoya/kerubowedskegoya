import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSiteSettings, type SiteSettings } from "#/server/site";

const REFETCH_INTERVAL_MS = 15_000;

export const siteSettingsQueryKey = ["site-settings"] as const;

export function siteSettingsQueryOptions(initialData?: SiteSettings) {
	return queryOptions({
		queryKey: siteSettingsQueryKey,
		queryFn: () => getSiteSettings(),
		initialData,
		staleTime: 5_000,
		refetchInterval: REFETCH_INTERVAL_MS,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
}

export function useSiteSettings(initialData?: SiteSettings) {
	return useQuery(siteSettingsQueryOptions(initialData));
}
