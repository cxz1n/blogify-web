import type { RouteObject } from "react-router-dom";
import Index from "../page/index";
import TheLayout from "../layout/TheLayout";
export interface customRouteObject {
  auth?: boolean;
  children?: customRouteObject;
}
export type RouteType = RouteObject & customRouteObject;
const route: RouteType[] = [
  {
    path: "/",
    element: <TheLayout />,
    children: [
      {
        index: true,
        element: <Index></Index>,
      },
      {
        path: "/index",
        element: <Index></Index>,
      },
    ],
  },
];

export default route;
