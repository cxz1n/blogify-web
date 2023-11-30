import { useEffect } from "react";
import { NavigateFunction,Location, useLocation, useNavigate, useRoutes } from "react-router-dom";
import { TokenEnum } from "../enums/httpEnum";
import { StorageKey } from "../enums/storageEnum";
import { RouteType} from './route';

const searchRouteInfo = (
    path: string,
    routes: RouteType[]
): RouteType | null => {
    for(let item of routes) {
        if(item.path === path) return item;
        if(item.children) {
            return searchRouteInfo(path, item.children)
        }
    }
    return null;
}
const guard = (
    location: Location,
    navigate: NavigateFunction,
    routes: RouteType[],
) => {
    const { pathname} = location;
    const routeInfo = searchRouteInfo(pathname, routes);

    if(!routeInfo) {
        return false;
    }

    //token鉴权
    if(routeInfo.auth) {
        const token =localStorage.getItem(StorageKey.ROOT) && JSON.parse(localStorage.getItem(StorageKey.ROOT) || '')[TokenEnum.TOKEN]
        if(!token) {
            navigate('/login')
            return false;
        }
    }
    return true;
}
export const Guard = (routes: any) => {
    const location = useLocation();
    const navigate= useNavigate();
    useEffect(()=> {
        guard(location, navigate, routes)
    },[location, navigate, routes]);
    const Route = useRoutes(routes);
    return Route;
}