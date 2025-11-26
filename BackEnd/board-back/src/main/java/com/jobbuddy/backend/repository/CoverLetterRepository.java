package com.jobbuddy.backend.repository;

import com.jobbuddy.backend.model.CoverLetter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {

    // 특정 유저의 자소서 1개 조회 (미리보기 / 다운로드 / 보관함 저장에 공통 사용)
    Optional<CoverLetter> findByIdAndOwnerId(Long id, Long ownerId);

    // 보관함 목록 조회용: 해당 유저의 archived=true 인 자소서들
    Page<CoverLetter> findByOwnerIdAndArchivedTrue(Long ownerId, Pageable pageable);
}