package com.tokiomarine.schedule.transfer.enums;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

public enum TaxRule {
    // Dias: 0, Valor Fixo: R$3.00, Percentual: 2.5%
    RULE_A(0, 0, new BigDecimal("3.00"), new BigDecimal("0.025")),

    // Dias: 1 a 10, Valor Fixo: R$12.00, Percentual: 0.0%
    RULE_B(1, 10, new BigDecimal("12.00"), new BigDecimal("0.000")),

    // Dias: 11 a 20, Valor Fixo: R$0.00, Percentual: 8.2%
    RULE_C(11, 20, new BigDecimal("0.00"), new BigDecimal("0.082")),

    // Dias: 21 a 30, Valor Fixo: R$0.00, Percentual: 6.9%
    RULE_D(21, 30, new BigDecimal("0.00"), new BigDecimal("0.069")),

    // Dias: 31 a 40, Valor Fixo: R$0.00, Percentual: 4.7%
    RULE_E(31, 40, new BigDecimal("0.00"), new BigDecimal("0.047")),

    // Dias: 41 a 50, Valor Fixo: R$0.00, Percentual: 1.7%
    RULE_F(41, 50, new BigDecimal("0.00"), new BigDecimal("0.017"));

    //---------------------------------------------------------

    private final int minDays;
    private final int maxDays;
    private final BigDecimal fixedFee;
    private final BigDecimal percentageRate;

    TaxRule(int minDays, int maxDays, BigDecimal fixedFee, BigDecimal percentageRate) {
        this.minDays = minDays;
        this.maxDays = maxDays;
        this.fixedFee = fixedFee;
        this.percentageRate = percentageRate;
    }

    public static Optional<TaxRule> getRuleByDays(long daysDifference) {
        for (TaxRule rule : values()) {
            if (daysDifference >= rule.minDays && daysDifference <= rule.maxDays) {
                return Optional.of(rule);
            }
        }
        return Optional.empty();
    }

    public BigDecimal calculateFee(BigDecimal transferValue) {
        BigDecimal percentageAmount = transferValue.multiply(this.percentageRate);
        BigDecimal calculatedFee = this.fixedFee.add(percentageAmount);
        
        return calculatedFee.setScale(2, RoundingMode.HALF_UP);
    }
}