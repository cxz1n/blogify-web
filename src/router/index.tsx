import route from "./route";
import { Guard } from "./guard";
import { Suspense } from "react";

const routes = () => {
    return (
        <Suspense>
            {Guard(route)}
        </Suspense>
    )
};
export default routes;