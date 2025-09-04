import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);
const isOverdue = localStorage.getItem("isOverdue");
	if (!isAuth && isPrivate) {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
			</>
		);
	}

	if (isAuth && !isPrivate) {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/", state: { from: rest.location } }} />;
			</>
		);
	}

	if (isAuth && isOverdue === "true" && rest.path !== "/financeiro") {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/financeiro" }} />
			</>
		);
	}

	return (
		<>
			{loading && <BackdropLoading />}
			<RouterRoute {...rest} component={Component} />
		</>
	);
};

export default Route;
