package com.Bank.bankofnothing.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class DemoFundsRequest {
    private List<Long> accountIds;

    public List<Long> getAccountIds() { return accountIds; }
    public void setAccountIds(List<Long> accountIds) { this.accountIds = accountIds; }
}
