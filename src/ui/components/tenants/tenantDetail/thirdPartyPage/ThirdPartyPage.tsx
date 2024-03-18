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
import { Dispatch, SetStateAction } from "react";
import { useThirdPartyService } from "../../../../../api/tenants";
import { TenantDashboardView } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS } from "../../../../../constants";
import { getImageUrl } from "../../../../../utils";
import { useTenantDetailContext } from "../TenantDetailContext";
import { TenantDetailHeader } from "../TenantDetailHeader";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { BuiltInProviderInfo } from "../thirdPartyProviderConfig/BuiltInProviderInfo";
import { CustomProviderInfo } from "../thirdPartyProviderConfig/CustomProviderInfo";
import "./thirdPartyPage.scss";

export const ThirdPartyPage = ({
	viewObj,
	setViewObj,
}: {
	viewObj: TenantDashboardView;
	setViewObj: Dispatch<SetStateAction<TenantDashboardView>>;
}) => {
	const handleProviderInfoBack = (shouldGoBackToDetailPage = false) => {
		if (
			viewObj.view === "add-or-edit-third-party-provider" &&
			viewObj.isAddingNewProvider &&
			!shouldGoBackToDetailPage
		) {
			setViewObj({ view: "list-third-party-providers" });
		} else {
			setViewObj({ view: "tenant-detail" });
		}
	};
	return (
		<div className="third-party-section">
			<button
				className="button flat"
				onClick={() => handleProviderInfoBack()}>
				<img
					src={getImageUrl("left-arrow-dark.svg")}
					alt="Go back"
				/>
				<span>
					{viewObj.view === "add-or-edit-third-party-provider" && viewObj.isAddingNewProvider
						? "Back to add new providers"
						: "Back to tenant info"}
				</span>
			</button>
			<div className="third-party-section__cards">
				<TenantDetailHeader onlyShowTenantId />
				{viewObj.view === "list-third-party-providers" && <ThirdPartyProvidersList setViewObj={setViewObj} />}
				{viewObj.view === "add-or-edit-third-party-provider" && (
					<ProviderInfo
						providerId={viewObj.thirdPartyId}
						isAddingNewProvider={viewObj.isAddingNewProvider}
						handleGoBack={handleProviderInfoBack}
					/>
				)}
			</div>
		</div>
	);
};

const ProviderInfo = ({
	providerId,
	isAddingNewProvider,
	handleGoBack,
}: {
	providerId?: string;
	isAddingNewProvider: boolean;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
}) => {
	const { resolvedProviders, tenantInfo, refetchTenant } = useTenantDetailContext();
	const { createOrUpdateThirdPartyProvider } = useThirdPartyService();
	const providerConfig = isAddingNewProvider
		? undefined
		: resolvedProviders.find((p) => p.thirdPartyId === providerId);
	const isInBuiltProvider =
		typeof providerId === "string" && IN_BUILT_THIRD_PARTY_PROVIDERS.some(({ id }) => providerId.startsWith(id));

	const handlePostSaveProviders = async (action: "add-or-update" | "delete", providerId: string) => {
		let promises: Array<Promise<unknown>> = [];
		if (resolvedProviders.length > 0 && tenantInfo.thirdParty.providers.length === 0) {
			if (action === "add-or-update" && isAddingNewProvider) {
				promises = resolvedProviders.map((provider) => {
					return createOrUpdateThirdPartyProvider(tenantInfo.tenantId, provider);
				});
			} else {
				promises = resolvedProviders
					.filter((provider) => provider.thirdPartyId !== providerId)
					.map((provider) => {
						return createOrUpdateThirdPartyProvider(tenantInfo.tenantId, provider);
					});
			}
		}
		await Promise.all(promises);
		await refetchTenant();
	};

	if (isInBuiltProvider) {
		return (
			<BuiltInProviderInfo
				providerId={providerId}
				providerConfig={providerConfig}
				handleGoBack={handleGoBack}
				isAddingNewProvider={isAddingNewProvider}
				handlePostSaveProviders={handlePostSaveProviders}
			/>
		);
	}

	// Handle custom providers here
	return (
		<CustomProviderInfo
			providerId={providerId}
			providerConfig={providerConfig}
			handleGoBack={handleGoBack}
			isAddingNewProvider={isAddingNewProvider}
			handlePostSaveProviders={handlePostSaveProviders}
		/>
	);
};

const ThirdPartyProvidersList = ({ setViewObj }: { setViewObj: Dispatch<SetStateAction<TenantDashboardView>> }) => {
	const handleAddNewInBuiltProvider = (providerId: string) => {
		window.scrollTo(0, 0);
		setViewObj({
			view: "add-or-edit-third-party-provider",
			thirdPartyId: providerId,
			isAddingNewProvider: true,
		});
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip>Add new Social / Enterprise Login Provider</PanelHeaderTitleWithTooltip>
			</PanelHeader>
			<div className="provider-list-header">
				Select the Provider that you want to add for you tenant from the list below
			</div>
			<div className="provider-list-container">
				<h2 className="provider-list-container__header-with-divider">Enterprise Providers</h2>
				<div className="provider-list-container__providers-grid">
					{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => provider.isEnterprise).map((provider) => {
						return (
							<ThirdPartyProviderButton
								key={provider.id}
								title={provider.label}
								icon={provider.icon}
								onClick={() => handleAddNewInBuiltProvider(provider.id)}
							/>
						);
					})}
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					Social Providers
				</h2>
				<div className="provider-list-container__providers-grid">
					{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => !provider.isEnterprise).map((provider) => {
						return (
							<ThirdPartyProviderButton
								key={provider.id}
								title={provider.label}
								icon={provider.icon}
								onClick={() => handleAddNewInBuiltProvider(provider.id)}
							/>
						);
					})}
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					Custom OAuth Providers
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add Custom Provider"
						type="without-icon"
						onClick={() => {
							window.scrollTo(0, 0);
							setViewObj({
								view: "add-or-edit-third-party-provider",
								isAddingNewProvider: true,
							});
						}}
					/>
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					SAML
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add SAML Provider"
						type="without-icon"
					/>
				</div>
			</div>
		</PanelRoot>
	);
};
