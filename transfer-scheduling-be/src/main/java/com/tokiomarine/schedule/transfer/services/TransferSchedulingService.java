package com.tokiomarine.schedule.transfer.services;

import com.tokiomarine.schedule.transfer.dto.SchedulingRequest;
import com.tokiomarine.schedule.transfer.entities.Scheduling;
import com.tokiomarine.schedule.transfer.enums.TaxRule;
import com.tokiomarine.schedule.transfer.exception.NoTaxRuleFoundException;
import com.tokiomarine.schedule.transfer.repositories.TransferSchedulingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TransferSchedulingService {

    @Autowired
    private TransferSchedulingRepository transferSchedulingRepository;

    public Scheduling scheduleTransfer(SchedulingRequest request) {

        LocalDate today = LocalDate.now();
        long daysDifference = ChronoUnit.DAYS.between(today, request.getTransferDate());

        TaxRule rule = TaxRule.getRuleByDays(daysDifference)
                .orElseThrow(() -> new NoTaxRuleFoundException(
                        String.format("No applicable tax rule found for transfers scheduled with %d days advance.", daysDifference)
                ));

        BigDecimal appliedFee = rule.calculateFee(request.getValue());

        Scheduling scheduling = mapToEntity(request, appliedFee, today);

        return transferSchedulingRepository.save(scheduling);
    }

    private Scheduling mapToEntity(SchedulingRequest request, BigDecimal appliedFee, LocalDate today) {

        BigDecimal totalValue = request.getValue().add(appliedFee);

        Scheduling scheduling = new Scheduling();


        scheduling.setOriginAccount(request.getOriginAccount());
        scheduling.setDestinationAccount(request.getDestinationAccount());
        scheduling.setTransferValue(request.getValue());
        scheduling.setTransferDate(request.getTransferDate());

        scheduling.setAppliedFee(appliedFee);
        scheduling.setTotalValueWithFee(totalValue.setScale(2, RoundingMode.HALF_UP));
        scheduling.setSchedulingDate(today);

        return scheduling;
    }

    public List<Scheduling> getAllSchedules() {
        return transferSchedulingRepository.findAll();
    }
}
