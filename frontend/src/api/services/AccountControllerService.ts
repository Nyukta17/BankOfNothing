/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountRequest } from '../models/AccountRequest';
import type { AccountResponse } from '../models/AccountResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountControllerService {
    /**
     * @returns AccountResponse OK
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<AccountResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounts',
        });
    }
    /**
     * @param requestBody
     * @returns AccountResponse OK
     * @throws ApiError
     */
    public static create(
        requestBody: AccountRequest,
    ): CancelablePromise<AccountResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AccountResponse OK
     * @throws ApiError
     */
    public static getById(
        id: number,
    ): CancelablePromise<AccountResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounts/{id}',
            path: {
                'id': id,
            },
        });
    }
}
