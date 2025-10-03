package com.tokiomarine.schedule.transfer.controller;

import com.tokiomarine.schedule.transfer.dto.SchedulingRequest;
import com.tokiomarine.schedule.transfer.entities.Scheduling;
import com.tokiomarine.schedule.transfer.exception.NoTaxRuleFoundException;

import com.tokiomarine.schedule.transfer.services.TransferSchedulingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
public class TransferSchedulingController {

    private final TransferSchedulingService service;


    public TransferSchedulingController(TransferSchedulingService service) {
        this.service = service;
    }


    @PostMapping
    public ResponseEntity<Scheduling> schedule(@Valid @RequestBody SchedulingRequest request) {
        Scheduling scheduledTransfer = service.scheduleTransfer(request);
        return new ResponseEntity<>(scheduledTransfer, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Scheduling>> getStatement() {
        List<Scheduling> schedules = service.getAllSchedules();

        return ResponseEntity.ok(schedules);
    }

    // --- Tratamento Global de Exceção de Negócio ---
    @ExceptionHandler(NoTaxRuleFoundException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleNoTaxRuleFoundException(NoTaxRuleFoundException ex) {
        return Map.of("error", ex.getMessage(), "status", String.valueOf(HttpStatus.BAD_REQUEST.value()));
    }
}