import { AxiosRequestConfig, AxiosResponse } from "axios";
import { RequestEnum, ResultEnum } from "../../enums/httpEnum";
import { isString } from "../is";
import { setObjToUrlParams } from "../url";
import { formatRequestDate, joinTimestamp } from "./helper";
import { RequestOptions, Result } from "./types";
import { message as antdMsg } from "antd";
import { StorageKey } from "../../enums/storageEnum";
import history from "../../router/history";

/**
 * 判断是否 url
 * */
 export function isUrl(url: string) {
    return /(^http|https:\/\/)/g.test(url);
  }
  
export interface CreateAxiosOptions extends AxiosRequestConfig {
    authenticationScheme?: string;
    transform?: AxiosTransform;
    requestOptions?: RequestOptions;
}
export abstract class AxiosTransform {
    // 请求之前处理配置
    beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

    // 请求成功处理
    transformRequestData?: (res: AxiosResponse<Result>, options: RequestOptions) => any;

    // 请求失败处理
    requestCatch?: (e: Error) => Promise<any>;

    // 请求之前的拦截器
    requestInterceptors?:(
        config: AxiosRequestConfig,
        options: CreateAxiosOptions
    ) => AxiosRequestConfig;

    // 请求之后的拦截器
    responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

    // 请求之后的拦截器错误处理
    requestInterceptorsCatch?:(error: Error) => void;

    // 请求之后的拦截器错误处理
    responseInterceptorsCatch?:(error: Error) => void;
}

const transform: AxiosTransform = {

    /**
     * @description: 请求之前处理config
     */
    beforeRequestHook: (config, options) => {
        const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options;
        const isUrlStr = isUrl(config.url as string);

        if(!isUrlStr && joinPrefix) {
            config.url = `${urlPrefix}${config.url}`
        }
        if(!isUrlStr && apiUrl && isString(apiUrl)) {
            config.url = `${apiUrl}${config.url}`
        }
        const params = config.params || {};
        const data = config.data || false;
        if(config.method?.toUpperCase()=== RequestEnum.GET) {
            if(!isString(params)) {
                // 给get请求加上时间戳参数，避免从缓存中拿数据。
                config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
            } else {
                config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
                config.params = undefined;
            }
        } else {
            if(!isString(params)) {
                formatDate && formatRequestDate(params);
                if(Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
                    config.data = data;
                    config.params = params;
                } else {
                    config.data = params;
                    config.params = undefined;
                }
                if(joinParamsToUrl) {
                    config.url = setObjToUrlParams(
                        config.url as  string,
                        Object.assign({}, config.params, config.data)
                    )
                };
            } else {
                config.url = config.url + params;
                config.params = undefined;
            }
        }
        return config;
    },
    /**
     * @description: 处理响应数据
     */
    transformRequestData: (res: AxiosResponse<Result>, options: RequestOptions) => {
        const { 
            isShowMessage = true,
            isShowErrorMessage,
            isShowSuccessMessage,
            successMessageText,
            errorMessageText,
            isTransformResponse,
            isReturnNativeResponse,
        } = options;

        // 是否返回原生响应头，比如：需要获取响应头时使用该属性
        if(isReturnNativeResponse) {
            return res;
        }

        // 用于页面代码可能需要直接获取code,data,message这些信息时
        if(!isTransformResponse) {
            return res.data;
        }

        const { data } = res;
        // 与服务端约定好的接口返回数据结构，这块可以根据自己的项目进行修改
        const code = data.code;
        const result = data.data;
        const message = data.message;
        // 请求成功
        
        const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS;
        // 是否显示提示信息
        if(isShowMessage) {
            if(hasSuccess && (successMessageText || isShowSuccessMessage)) {
                // 是否显示成功信息提示
            } else if (!hasSuccess && (errorMessageText || isShowErrorMessage)) {
                antdMsg.error(message || errorMessageText || '操作失败');
                // 是否显示错误信息提示
            } else if (!hasSuccess && options.errorMessageMode === 'modal') {
                // errorMessageMode = 'modal'时会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
            }
        }

        // 接口请求成功，返回内容
        if ( code === ResultEnum.SUCCESS) {
            return result;
        }

        // 接口请求失败， 统一提示错误信息
        let errorMsg = message;
        switch (code) {
            // 请求失败
            case ResultEnum.ERROR:
                if(data.statusCode === ResultEnum.Unauthorized) {
                    console.log('push>>login>>');
                    history.push('/login')
                }
                break;
            case ResultEnum.TIMEOUT:
                break;
        }
        throw new Error(errorMsg);
    },
    /**
     * @description: 请求拦截器处理
     * @param config 
     * @param options 
     * @returns config
     */
    requestInterceptors: (config, options) => {
        // 请求之前处理config
        // console.log(JSON.parse(localStorage.getItem('persist:root') || '')?.token);
        const token = localStorage.getItem(StorageKey.ROOT) && JSON.parse(JSON.parse(localStorage.getItem(StorageKey.ROOT) || '')?.info).token;
        if(token && (config as Recordable)?.requestOptions?.withToken !== false) {
            (config as Recordable).headers['token'] = options.authenticationScheme
                ? `${options.authenticationScheme} ${token}`
                : token;
        }
        return config;
    },
}

export default transform;