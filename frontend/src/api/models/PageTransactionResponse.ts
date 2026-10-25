/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { SortObject } from './SortObject';
import type { TransactionResponse } from './TransactionResponse';
export type PageTransactionResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<TransactionResponse>;
    number?: number;
    numberOfElements?: number;
    pageable?: PageableObject;
    sort?: SortObject;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

