import { RequestEnum } from "../enums/httpEnum";
import { http } from "../utils/axios";

export interface loginParam {
    username: string;
    password: string;
}

export function login(data: loginParam) {
    return http.request({
        url: '/auth/login',
        method: RequestEnum.POST,
        data,
    },
        {
            withToken: true,
            isShowErrorMessage: true
        }
    )
}