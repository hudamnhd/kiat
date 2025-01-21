import { createBrowserRouter, RouterProvider } from "react-router";
import Index from "./routes/index";
import Muslim from "./routes/muslim";
import Tools from "./routes/tools";
import Layout from "#src/components/custom/layout";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <Index />,
			},
			{
				path: "/muslim",
				element: <Muslim />,
			},
			{
				path: "/tools",
				element: <Tools />,
			},
		],
	},
]);
