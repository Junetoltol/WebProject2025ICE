package com.jobbuddy.backend.service;
//만든놈 최은준

import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.dto.CoverLetterReqDto;
import com.jobbuddy.backend.dto.PageResponse;
import com.jobbuddy.backend.model.CoverLetter;
import com.jobbuddy.backend.model.CoverLetterStatus;
import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.repository.CoverLetterRepository;
import com.jobbuddy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CoverLetterServiceImpl implements CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;

    @Autowired
    public CoverLetterServiceImpl(CoverLetterRepository coverLetterRepository,
                                  UserRepository userRepository) {
        this.coverLetterRepository = coverLetterRepository;
        this.userRepository = userRepository;
    }

    // ===================== 미리보기 =====================

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

    // ===================== 파일 다운로드 & 보관함 저장 =====================

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
        String dummy = "Cover letter " + coverLetter.getId() + " (" + normalized + ")";
        byte[] bytes = dummy.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    @Override
    @Transactional
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

    // ===================== 초안 저장/수정 =====================

    @Override
    @Transactional
    public Long saveOrUpdateCoverLetter(Long userId,
                                        Long coverLetterId,
                                        CoverLetterReqDto.SaveRequest request) {

        if (coverLetterId == null) {
            // 새로 생성 (POST)
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            CoverLetter coverLetter = new CoverLetter();
            coverLetter.setOwner(user);
            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections()
            );
            // 초기 상태값 (필요시 SUCCESS, DRAFT 등으로 변경 가능)
            coverLetter.setStatus(CoverLetterStatus.PROCESSING);

            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // 수정 (PATCH)
            CoverLetter coverLetter =
                    coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                            .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections()
            );
            return coverLetter.getId();
        }
    }

    // ===================== 템플릿 선택 =====================

    @Override
    @Transactional
    public void updateTemplate(Long userId, Long resumeId, String templateId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTemplate(templateId);
    }

    // ===================== 구성 설정 저장 =====================

    @Override
    @Transactional
    public void updateSettings(Long userId,
                               Long coverLetterId,
                               List<String> questions,
                               String tone,
                               Integer lengthPerQuestion) {

        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.setQuestions(questions);
        coverLetter.setTone(tone);
        coverLetter.setLengthPerQuestion(lengthPerQuestion);
    }

    // ===================== 생성 요청 =====================

    @Override
    @Transactional
    public void generateCoverLetter(Long userId, Long coverLetterId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        // 생성 시작 상태 변경
        coverLetter.startProcessing();

        // TODO: 실제 AI 생성 로직 연동 (비동기 처리 권장)
    }

    // ===================== 보관함: 문서 삭제 =====================

    @Override
    @Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetterRepository.delete(coverLetter);
    }

    // ===================== 보관함: 제목 변경 =====================

    @Override
    @Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTitle(newTitle);
    }
}
