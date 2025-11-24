package com.jobbuddy.backend.service;
//만든놈 최은준

import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.model.CoverLetter;
import com.jobbuddy.backend.model.CoverLetterStatus;
import com.jobbuddy.backend.repository.CoverLetterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.stream.Collectors;

import java.nio.charset.StandardCharsets;

import java.util.NoSuchElementException;

@Service
public class CoverLetterServiceImpl implements CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;

    @Autowired
    public CoverLetterServiceImpl(CoverLetterRepository coverLetterRepository) {
        this.coverLetterRepository = coverLetterRepository;
    }

    @Override
    public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
        // 1) 해당 유저의 자소서 찾기
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 2) 아직 생성 안 된 상태면 에러
        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            // 나중에 컨트롤러에서 이 예외를 잡아서 409 상태코드로 내려주면 됨
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        // 3) 엔티티 → DTO 매핑
        return new CoverLetterPreviewResponse(
                coverLetter.getId(),
                coverLetter.getTitle(),
                coverLetter.getQuestions(),
                coverLetter.getTone(),
                coverLetter.getLengthPerQuestion(),
                coverLetter.getStatus().name(),
                coverLetter.getPreviewUrl(),
                coverLetter.getCreatedAt(),
                coverLetter.getUpdatedAt()
        );
    }
        @Override
    public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
        // 1) 자소서 + 소유자 검증
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 2) 생성 상태 확인
        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        // 3) 포맷 검증
        String normalized = format == null ? "" : format.toLowerCase();
        if (!normalized.equals("word") && !normalized.equals("pdf")) {
            throw new IllegalArgumentException("Unsupported format.");
        }

        // 4) 실제 파일 생성 로직은 나중에 구현
        //    지금은 임시로 텍스트를 바이트로 만든 더미 파일을 반환
        String dummy = "Cover letter " + coverLetter.getId() + " (" + normalized + ")";
        byte[] bytes = dummy.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    @Override
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
        // 1) 자소서 + 소유자 검증
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 2) 생성 상태 확인
        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        // 3) 보관함 플래그 활성화
        coverLetter.setArchived(true);
        coverLetterRepository.save(coverLetter);
    }
        @Override
    public PageResponse<CoverLetterListItemResponse> getArchivedCoverLetters(
            Long userId,
            String q,
            String tone,
            String sort,
            int page,
            int size
    ) {
        // 정렬 파싱: "updatedAt,desc" 형태 기준
        Sort sortObj;
        if (sort == null || sort.isBlank()) {
            sortObj = Sort.by(Sort.Direction.DESC, "updatedAt");
        } else {
            String[] parts = sort.split(",");
            String property = parts[0];
            Sort.Direction direction =
                    (parts.length > 1 && parts[1].equalsIgnoreCase("asc"))
                            ? Sort.Direction.ASC
                            : Sort.Direction.DESC;
            sortObj = Sort.by(direction, property);
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        // 기본: 보관함(archived=true) + 해당 사용자
        Page<CoverLetter> pageResult =
                coverLetterRepository.findByOwnerIdAndArchivedTrue(userId, pageable);

        // TODO: q, tone 필터링이 필요하면 여기서 추가 로직으로 확장

        // 엔티티 -> DTO 매핑
        var content = pageResult.getContent().stream()
                .map(c -> new CoverLetterListItemResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getPreviewUrl(),
                        c.getUpdatedAt()
                ))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages()
        );
    }


}
