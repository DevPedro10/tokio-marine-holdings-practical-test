package com.tokiomarine.schedule.transfer.repositories;

import com.tokiomarine.schedule.transfer.entities.Scheduling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransferSchedulingRepository extends JpaRepository<Scheduling, Long> {
}
