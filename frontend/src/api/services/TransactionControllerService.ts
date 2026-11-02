/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CaptureRequest } from '../models/CaptureRequest';
import type { DemoFundsRequest } from '../models/DemoFundsRequest';
import type { HoldRequest } from '../models/HoldRequest';
import type { PageTransactionResponse } from '../models/PageTransactionResponse';
import type { TransactionResponse } from '../models/TransactionResponse';
import type { TransferByNumberRequest } from '../models/TransferByNumberRequest';
import type { TransferRequest } from '../models/TransferRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionControllerService {
    /**
     * @param authorization
     * @param page
     * @param size
     * @returns PageTransactionResponse OK
     * @throws ApiError
     */
    public static getHistory(
        authorization: string,
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageTransactionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions',
            headers: {
                'Authorization': authorization,
            },
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param requestBody
     * @returns TransactionResponse OK
     * @throws ApiError
     */
    public static transferByAccountNumber(
        requestBody: TransferByNumberRequest,
    ): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns TransactionResponse OK
     * @throws ApiError
     */
    public static transfer(
        requestBody: TransferRequest,
    ): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions/transfer',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static hold(
        requestBody: HoldRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions/hold',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static demoTopup(
        requestBody: DemoFundsRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions/demo-topup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static capture(
        requestBody: CaptureRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions/capture',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
