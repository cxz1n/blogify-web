import { RequestEnum } from "../enums/httpEnum";
import { http } from "../utils/axios";

export function getArticle(params: any) {
    return http.request({
        url: '/article/pc',
        method: RequestEnum.GET,
        params
    })
}

export function getArticleById(id: String) {
    return http.request({
        url: `/article/${id}`,
        method: RequestEnum.GET,
    })
}

export function createArticle(data: any) {
    return http.request({
        url: '/article',
        method: RequestEnum.POST,
        data
    })
}

export function editArticle(data: any) {
    return http.request({
        url: '/article',
        method: RequestEnum.PUT,
        data
    })
}

export function delArticle(id: string) {
    return http.request({
        url: '/article/'+id,
        method: RequestEnum.DELETE,
    })
}