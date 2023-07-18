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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { GetUserInfoResult, UpdateUserInformationResponse, useUserService } from "../../../api/user";
import useVerifyUserEmail from "../../../api/user/email/verify";
import useMetadataService from "../../../api/user/metadata";
import useSessionsForUserService from "../../../api/user/sessions";
import { getImageUrl, getRecipeNameFromid } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { EmailVerificationStatus, UserRecipeType, UserWithRecipeId } from "../../pages/usersList/types";
import { OnSelectUserFunction } from "../usersListTable/UsersListTable";
import { UserDetailContextProvider } from "./context/UserDetailContext";
import "./userDetail.scss";
import { getUpdateUserToast } from "./userDetailForm";
import UserDetailHeader from "./userDetailHeader";
import UserDetailInfoGrid from "./userDetailInfoGrid";
import { SessionInfo, UserDetailsSessionList } from "./userDetailSessionList";
import { UserMetaDataSection } from "./userMetaDataSection";

export type UserDetailProps = {
	user: string;
	recipeId: string;
	onBackButtonClicked: () => void;
	onDeleteCallback: OnSelectUserFunction;
	onSendEmailVerificationCallback: (user: UserWithRecipeId) => Promise<boolean>;
	onUpdateEmailVerificationStatusCallback: (userId: string, isVerified: boolean) => Promise<boolean>;
	onChangePasswordCallback: (userId: string, newPassword: string) => Promise<void>;
};

export const UserDetail: React.FC<UserDetailProps> = (props) => {
	const { onBackButtonClicked, user, recipeId } = props;
	const [userDetail, setUserDetail] = useState<GetUserInfoResult | undefined>(undefined);
	const [sessionList, setSessionList] = useState<SessionInfo[] | undefined>(undefined);
	const [userMetaData, setUserMetaData] = useState<string | undefined>(undefined);
	const [emailVerificationStatus, setEmailVerificationStatus] = useState<EmailVerificationStatus | undefined>(
		undefined
	);
	const [shouldShowLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);

	const { getUser, updateUserInformation } = useUserService();

	const { getUserEmailVerificationStatus } = useVerifyUserEmail();
	const { getUserMetaData } = useMetadataService();
	const { getSessionsForUser } = useSessionsForUserService();

	const loadUserDetail = useCallback(async () => {
		const userDetailsResponse = await getUser(user, recipeId);
		setUserDetail(userDetailsResponse);
	}, []);

	useEffect(() => {
		void loadUserDetail();
	}, [loadUserDetail]);

	const { showToast } = useContext(PopupContentContext);

	const updateUser = useCallback(
		async (userId: string, data: UserWithRecipeId): Promise<UpdateUserInformationResponse> => {
			const userInfoResponse = await updateUserInformation({
				userId,
				recipeId: data.recipeId,
				email: data.user.email,
				phone: data.recipeId === "passwordless" ? data.user.phoneNumber : "",
				firstName: data.user.firstName,
				lastName: data.user.lastName,
			});
			showToast(getUpdateUserToast(userInfoResponse.status === "OK"));
			return userInfoResponse;
		},
		[showToast]
	);

	const fetchUserMetaData = useCallback(async () => {
		const metaDataResponse = await getUserMetaData(user);

		if (metaDataResponse === "FEATURE_NOT_ENABLED_ERROR") {
			setUserMetaData("Feature Not Enabled");
		} else if (metaDataResponse !== undefined) {
			setUserMetaData(JSON.stringify(metaDataResponse));
		} else {
			setUserMetaData("{}");
		}
	}, []);

	useEffect(() => {
		void fetchUserMetaData();
	}, [fetchUserMetaData]);

	const fetchSession = useCallback(async () => {
		let response = await getSessionsForUser(user);

		if (response === undefined) {
			response = [];
		}

		setSessionList(response);
	}, []);

	useEffect(() => {
		void fetchSession();
	}, [fetchSession]);

	const fetchEmailVerificationStatus = useCallback(async () => {
		const response: EmailVerificationStatus = await getUserEmailVerificationStatus(user);

		setEmailVerificationStatus(response);
	}, []);

	useEffect(() => {
		void fetchEmailVerificationStatus();
	}, [fetchEmailVerificationStatus]);

	const refetchAllData = async () => {
		await loadUserDetail();
		await fetchUserMetaData();
		await fetchSession();
		await fetchEmailVerificationStatus();
	};

	const showLoadingOverlay = () => {
		setShowLoadingOverlay(true);
	};

	const hideLoadingOverlay = () => {
		setShowLoadingOverlay(false);
	};

	if (userDetail === undefined) {
		return (
			<div className="user-detail-page-loader">
				<div className="loader"></div>
			</div>
		);
	}

	if (userDetail.status === "NO_USER_FOUND_ERROR") {
		return (
			<div className="user-detail center-children">
				<p className="subtitle">User could not be found</p>
				<span
					className="back-button"
					onClick={onBackButtonClicked}>
					Back
				</span>
			</div>
		);
	}

	if (userDetail.status === "RECIPE_NOT_INITIALISED") {
		const recipeName = getRecipeNameFromid(recipeId as UserRecipeType);

		return (
			<div className="user-detail center-children">
				<p className="subtitle">{`${recipeName} recipe has not been initialised`}</p>
				<span
					className="back-button"
					onClick={onBackButtonClicked}>
					Back
				</span>
			</div>
		);
	}

	return (
		<UserDetailContextProvider
			showLoadingOverlay={showLoadingOverlay}
			hideLoadingOverlay={hideLoadingOverlay}>
			<div className="user-detail">
				{shouldShowLoadingOverlay && (
					<div className="full-screen-loading-overlay">
						<div className="loader-container">
							<div className="loader"></div>
						</div>
					</div>
				)}
				<div className="user-detail__navigation">
					<button
						className="button flat"
						onClick={onBackButtonClicked}>
						<img
							src={getImageUrl("left-arrow-dark.svg")}
							alt="Back to all users"
						/>
						<span>Back to all users</span>
					</button>
				</div>
				<UserDetailHeader
					userDetail={userDetail.user}
					{...props}
				/>
				<UserDetailInfoGrid
					userDetail={userDetail.user}
					refetchData={refetchAllData}
					onUpdateCallback={updateUser}
					emailVerificationStatus={emailVerificationStatus}
					{...props}
				/>
				<UserMetaDataSection
					metadata={userMetaData}
					userId={user}
					refetchData={refetchAllData}
				/>

				<UserDetailsSessionList
					sessionList={sessionList}
					refetchData={refetchAllData}
				/>
			</div>
		</UserDetailContextProvider>
	);
};

export default UserDetail;
