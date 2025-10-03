package com.tokiomarine.schedule.transfer.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

import javax.validation.constraints.FutureOrPresent;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Positive;

@Data
public class SchedulingRequest {

    // Accounts (Basic validation for 10 digits)
    @NotBlank(message = "Origin account is required.")
    @Pattern(regexp = "\\d{10}", message = "Origin account must have 10 digits.")
    private String originAccount;

    @NotBlank(message = "Destination account is required.")
    @Pattern(regexp = "\\d{10}", message = "Destination account must have 10 digits.")
    private String destinationAccount;

    // Transfer Value
    @NotNull(message = "The transfer value is required.")
    @Positive(message = "The value must be positive.")
    private BigDecimal value;

    // Transfer Date (Cannot be in the past)
    @NotNull(message = "The transfer date is required.")
    @FutureOrPresent(message = "The transfer date cannot be in the past.")
    private LocalDate transferDate;
}
