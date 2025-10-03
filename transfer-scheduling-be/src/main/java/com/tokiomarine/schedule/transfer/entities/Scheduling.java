package com.tokiomarine.schedule.transfer.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Scheduling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String originAccount;
    private String destinationAccount;
    private BigDecimal transferValue;

    private BigDecimal appliedFee;
    private BigDecimal totalValueWithFee;
    private LocalDate transferDate;
    private LocalDate schedulingDate;
}