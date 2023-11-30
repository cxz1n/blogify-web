import axios from "axios";
import type { AxiosRequestConfig,  AxiosInstance, AxiosResponse } from 'axios';
import { cloneDeep, isFunction, isObject } from 'lodash-es';
import { ContentTypeEnum } from "../../enums/httpEnum";
import { AxiosCanceler } from "./axiosCancel";
import transform, { AxiosTransform } from "./axiosTransform";
import { RequestOptions } from "./types";

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
    let key: string;
    for (key in target) {
      src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
    }
    return src;
  }
interface CreateAxiosOptions extends AxiosRequestConfig {
    requestOptions? : RequestOptions;
    transform? : AxiosTransform;
    authenticationScheme?: string;
}

class VAxios {
    private axiosInstance: AxiosInstance;
    private options: CreateAxiosOptions;
    constructor(options: CreateAxiosOptions) {
        this.options = options;
        this.axiosInstance = axios.create(options);
        this.setupInterceptors();
    }
    /**
     * @description: 请求方法
     */
    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        let conf: CreateAxiosOptions = cloneDeep(config);
        const { requestOptions }  = this.options;
        const opt: RequestOptions = Object.assign({}, requestOptions, options);
        const { beforeRequestHook, transformRequestData, requestCatch } = transform || {};
        if(beforeRequestHook && isFunction(beforeRequestHook)) {
            conf = beforeRequestHook(conf, opt);
        }
        conf.requestOptions = opt;
        return new Promise((resolve, reject) => {
            this.axiosInstance
                .request<any, AxiosResponse<T>>(conf)
                .then((res: AxiosResponse<T>)=> {
                    // 请求是否被取消
                    const isCancel = axios.isCancel(res);
                    if(transformRequestData && isFunction(transformRequestData) && !isCancel) {
                        try {
                            const ret = transformRequestData(res, opt);
                            resolve(ret);
                        } catch (err) {
                            reject(err || new Error('request error!'));
                        }
                        return;
                    }
                    resolve(res as unknown as Promise<T>);
                })
                .catch((e: Error) => {
                    console.log(e);
                    if(requestCatch && isFunction(requestCatch)) {
                        console.log(e);
                        reject(requestCatch(e));
                        return;
                    }
                    reject(e)
                })
        })
    }

    private setupInterceptors() {
        const {
            requestInterceptors,
            requestInterceptorsCatch,
            responseInterceptors,
            responseInterceptorsCatch
        } = transform;

        const axiosCanceler = new AxiosCanceler();

        // 请求拦截器配置处理
        this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
            const ignoreCancel = 
            this.options.requestOptions?.ignoreCancelToken;

            !ignoreCancel && axiosCanceler.addPending(config);
            if(requestInterceptors && isFunction(requestInterceptors)) {
                config = requestInterceptors(config, this.options);
            }
            return config;
        }, undefined);

        // 请求拦截器错误捕获
        requestInterceptorsCatch &&
            isFunction(requestInterceptorsCatch) &&
            this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);

        // 响应结果拦截器处理
        this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
            res && axiosCanceler.removePending(res.config);
            if(responseInterceptors && isFunction(responseInterceptors)) {
                res = responseInterceptors(res);
            }
            return res;
        }, undefined);

        // 响应结果拦截器错误捕获
        responseInterceptorsCatch &&
            isFunction(responseInterceptorsCatch) && 
            this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch);
    }
}
function createAxios() {
    return new VAxios(deepMerge(
        {
            timeout: 10 * 1000,
            transform,
            headers: { 'Content-Type': ContentTypeEnum.JSON },
            requestOptions: {
                // 默认将prefix 添加到url
                joinPrefix: true,
                // 是否返回原生响应头 比如：需要获取响应头时使用该属性
                isReturnNativeResponse: false,
                // 需要对返回数据进行处理
                isTransformResponse: true,
                // post请求的时候添加参数到url
                joinParamsToUrl: false,
                // 格式化提交参数时间
                formatDate: true,
                // 消息提示类型
                errorMessageMode: 'none',
                // 接口地址
                // apiUrl: globSetting.apiUrl,
                // 接口拼接地址
                urlPrefix: '/api',
                //  是否加入时间戳
                joinTime: true,
                // 忽略重复请求
                ignoreCancelToken: true,
                // 是否携带token
                withToken: true,
            }
        }
    ));
}
  
export const http = createAxios();