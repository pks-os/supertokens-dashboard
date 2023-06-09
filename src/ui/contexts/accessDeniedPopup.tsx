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
import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { DASHBOARD_ACCESS_DENIED_EVENT } from "../events/accessDenied";

export const AccessDeniedPopupContext = createContext<{
	showPopup: (message: string) => void;
	hidePopup: () => void;
	isPopupVisible: boolean;
	popupMessage: string;
}>({
	showPopup: () => {
		return;
	},
	isPopupVisible: false,
	popupMessage: "",
	hidePopup: () => {
		return;
	},
});

export const AccessDeniedContextProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");

	const handleAccessDenied = (e: CustomEvent) => {
		showPopup(e.detail.message);
	};

	useEffect(() => {
		window.addEventListener(DASHBOARD_ACCESS_DENIED_EVENT, handleAccessDenied as EventListener);

		return () => {
			window.removeEventListener(DASHBOARD_ACCESS_DENIED_EVENT, handleAccessDenied as EventListener);
		};
	}, []);

	const showPopup = (message: string) => {
		if (isPopupVisible) {
			return;
		}

		setPopupMessage(message);
		setIsPopupVisible(true);
	};

	const hidePopup = () => {
		if (!isPopupVisible) {
			return;
		}

		setPopupMessage("");
		setIsPopupVisible(false);
	};

	return (
		<AccessDeniedPopupContext.Provider
			value={{
				isPopupVisible,
				popupMessage,
				showPopup,
				hidePopup,
			}}>
			{props.children}
		</AccessDeniedPopupContext.Provider>
	);
};
