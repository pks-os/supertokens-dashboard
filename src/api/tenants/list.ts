/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { getApiUrl, useFetchData } from "../../utils";

export type PasswordlessContactMethod = "PHONE" | "EMAIL" | "EMAIL_OR_PHONE";

export type Tenant = {
	tenantId: string;
	firstFactors: string[];
};

type TenantsLoginMethodsResponse = {
	status: "OK";
	tenants: Tenant[];
};

type TenantsListService = {
	fetchTenants: () => Promise<TenantsLoginMethodsResponse | undefined>;
};

export const useListTenants = (): TenantsListService => {
	const fetchData = useFetchData();
	const fetchTenants = async (): Promise<TenantsLoginMethodsResponse> => {
		const response = await fetchData({
			method: "GET",
			url: getApiUrl("/api/tenants"),
		});

		return response.ok ? await response.json() : undefined;
	};

	return {
		fetchTenants,
	};
};
