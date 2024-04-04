/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import { CoreConfigOptions, ProviderConfig, TenantInfo, UpdateTenant } from "./types";

export const useTenantCreateService = () => {
	const fetchData = useFetchData(true);

	const createOrUpdateTenant = async (
		tenantId: string
	): Promise<
		| {
				status: "OK";
				createdNew: boolean;
		  }
		| {
				status: "MULTITENANCY_NOT_ENABLED_IN_CORE";
		  }
		| {
				status: "INVALID_TENANT_ID";
				message: string;
		  }
		| undefined
	> => {
		const response = await fetchData({
			url: getApiUrl("/api/tenant"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					tenantId,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	return createOrUpdateTenant;
};

export const useCoreConfigService = () => {
	const fetchData = useFetchData();

	const getCoreConfigOptions = async (): Promise<{
		status: "OK";
		config: CoreConfigOptions;
	}> => {
		// const response = await fetchData({
		// 	url: getApiUrl("/api/core/config/list"),
		// 	method: "GET",
		// });

		// if (response.ok) {
		// 	const body = await response.json();
		// 	return body;
		// }

		// throw new Error("Cannot fetch core config options");

		return {
			status: "OK",
			config: [],
		};
	};

	return {
		getCoreConfigOptions,
	};
};

export const useTenantService = () => {
	const fetchData = useFetchData();

	const getTenantInfo = async (
		tenantId: string
	): Promise<
		| {
				status: "OK";
				tenant: TenantInfo;
		  }
		| {
				status: "UNKNOWN_TENANT_ERROR";
		  }
		| undefined
	> => {
		const response = await fetchData({
			url: getApiUrl(`/api/tenant?tenantId=${tenantId}`),
			method: "GET",
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		return undefined;
	};

	const updateTenant = async (
		tenantId: string,
		tenantInfo: UpdateTenant
	): Promise<{
		status: "OK";
	}> => {
		const response = await fetchData({
			url: getApiUrl("/api/tenant"),
			method: "PUT",
			config: {
				body: JSON.stringify({ ...tenantInfo, tenantId }),
			},
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	const deleteTenant = async (tenantId: string): Promise<{ status: "OK" }> => {
		const response = await fetchData({
			url: getApiUrl(`/api/tenant?tenantId=${tenantId}`),
			method: "DELETE",
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return {
		getTenantInfo,
		updateTenant,
		deleteTenant,
	};
};

export const useThirdPartyService = () => {
	const fetchData = useFetchData();

	const createOrUpdateThirdPartyProvider = async (tenantId: string, providerConfig: ProviderConfig) => {
		const response = await fetchData({
			url: getApiUrl("/api/tenants/third-party"),
			method: "PUT",
			config: {
				body: JSON.stringify({
					tenantId,
					providerConfig,
				}),
			},
		});

		if (response.ok) {
			const body = await response.json();
			return body;
		}

		throw new Error("Unknown error");
	};

	const deleteThirdPartyProvider = async (tenantId: string, providerId: string) => {
		const response = await fetchData({
			url: getApiUrl(`/api/tenants/third-party?tenantId=${tenantId}&thirdPartyId=${providerId}`),
			method: "DELETE",
		});

		if (response.ok) {
			return {
				status: "OK",
			};
		}

		throw new Error("Unknown error");
	};

	return {
		createOrUpdateThirdPartyProvider,
		deleteThirdPartyProvider,
	};
};
