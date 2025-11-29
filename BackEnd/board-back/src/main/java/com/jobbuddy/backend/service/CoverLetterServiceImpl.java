package com.jobbuddy.backend.service;
// 만든놈 최은준

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobbuddy.backend.ai.AiCoverLetterClient;
import com.jobbuddy.backend.ai.AiCoverLetterClient.AiCoverLetterRequest;
import com.jobbuddy.backend.ai.AiCoverLetterClient.AiCoverLetterResponse;
import com.jobbuddy.backend.ai.AiCoverLetterClient.EssayConfig;
import com.jobbuddy.backend.ai.AiCoverLetterClient.ResumeData;
import com.jobbuddy.backend.dto.CoverLetterSectionDto;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.dto.CoverLetterReqDto;
import com.jobbuddy.backend.dto.PageResponse;
import com.jobbuddy.backend.model.CoverLetter;
import com.jobbuddy.backend.model.CoverLetterStatus;
import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.repository.CoverLetterRepository;
import com.jobbuddy.backend.repository.UserRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// DOCX (Apache POI)
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;

// PDF (Apache PDFBox)
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

// 🔹 자바 기본 IO
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CoverLetterServiceImpl implements CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;
    private final AiCoverLetterClient aiCoverLetterClient;

    public CoverLetterServiceImpl(CoverLetterRepository coverLetterRepository,
                                  UserRepository userRepository,
                                  AiCoverLetterClient aiCoverLetterClient) {
        this.coverLetterRepository = coverLetterRepository;
        this.userRepository = userRepository;
        this.aiCoverLetterClient = aiCoverLetterClient;
    }

// =================================================================================
// (1), (3), (5) 미리보기 조회
//  - sections에 generatedCoverLetter까지 담아서 내려줌
// =================================================================================
@Override
@Transactional(readOnly = true)
public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
    CoverLetter coverLetter = coverLetterRepository
            .findByIdAndOwnerId(coverLetterId, userId)
            .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

    // 🔹 AI가 생성한 본문 꺼내기
    String generated = null;
    if (coverLetter.getSections() != null &&
            coverLetter.getSections().containsKey("generatedCoverLetter")) {
        generated = String.valueOf(
                coverLetter.getSections().get("generatedCoverLetter")
        );
    }

    // 🔹 섹션 DTO 리스트 만들기 (현재는 한 문항에 한 본문)
    List<CoverLetterSectionDto> sectionDtos = null;
    if (generated != null && !generated.isBlank()) {
        String questionTitle = "자기소개서";
        List<String> questions = coverLetter.getQuestions();
        if (questions != null && !questions.isEmpty()) {
            questionTitle = questions.get(0);
        }

        sectionDtos = List.of(
                new CoverLetterSectionDto(
                        questionTitle,
                        generated
                )
        );
    }

    return new CoverLetterPreviewResponse(
            coverLetter.getId(),
            coverLetter.getTitle(),
            coverLetter.getQuestions(),
            coverLetter.getTone(),
            coverLetter.getLengthPerQuestion(),
            coverLetter.getStatus() != null ? coverLetter.getStatus().name() : "PROCESSING",
            coverLetter.getPreviewUrl(),
            coverLetter.getCreatedAt(),
            coverLetter.getUpdatedAt(),
            sectionDtos   // 🔹 여기!
    );
}


    // =================================================================================
    // (1) 임시 저장
    // =================================================================================
    @Override
    @Transactional
    public Long saveOrUpdateCoverLetter(Long userId,
                                        Long coverLetterId,
                                        CoverLetterReqDto.SaveRequest request) {
        if (coverLetterId == null) {
            // 새로 생성
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
            // vA 정책: 새로 생성 시 바로 보관함 대상으로 취급
            coverLetter.setArchived(true);
            coverLetter.setStatus(CoverLetterStatus.PROCESSING);

            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // 수정
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

    // =================================================================================
    // (2) 설정 저장
    // =================================================================================
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

    // =================================================================================
    // (2), (3) 생성 요청 – vA 베이스 + vB의 섹션 파싱/유연성 + vA 에러 처리
    // =================================================================================
@Override
@Transactional
public void generateCoverLetter(Long userId, Long coverLetterId) {
    CoverLetter coverLetter = coverLetterRepository
            .findByIdAndOwnerId(coverLetterId, userId)
            .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

    // vA 도메인 메서드 사용: 상태를 PROCESSING 으로
    coverLetter.startProcessing();
    coverLetterRepository.save(coverLetter);

    try {
        AiCoverLetterRequest req = new AiCoverLetterRequest();
        Map<String, Object> sections = coverLetter.getSections();
        ResumeData data = new ResumeData();

        if (sections != null) {
            // profile
            Object profileObj = sections.get("profile");
            if (profileObj instanceof Map<?, ?>) {
                @SuppressWarnings("unchecked")
                Map<String, Object> profileMap = (Map<String, Object>) profileObj;
                data.setProfile(profileMap);
            }

            // experiences ← experiences | experience | educationExperience
            Object expObj = sections.get("experiences");
            if (expObj == null) expObj = sections.get("experience");
            if (expObj == null) expObj = sections.get("educationExperience");
            if (expObj instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> expList = (List<Map<String, Object>>) expObj;
                data.setExperiences(expList);
            }

            // projects ← projects | projectExperience
            Object projObj = sections.get("projects");
            if (projObj == null) projObj = sections.get("projectExperience");
            if (projObj instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> projList = (List<Map<String, Object>>) projObj;
                data.setProjects(projList);
            }

            // activities ← activities | club | clubs
            Object actObj = sections.get("activities");
            if (actObj == null) actObj = sections.get("club");
            if (actObj == null) actObj = sections.get("clubs");
            if (actObj instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> actList = (List<Map<String, Object>>) actObj;
                data.setActivities(actList);
            }

            // awards
            Object awardsObj = sections.get("awards");
            if (awardsObj instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> awardsList = (List<Map<String, Object>>) awardsObj;
                data.setAwards(awardsList);
            }

            // skills ← skills | technicalSkills
            Object skillsObj = sections.get("skills");
            if (skillsObj == null) skillsObj = sections.get("technicalSkills");
            if (skillsObj instanceof List<?>) {
                List<?> rawList = (List<?>) skillsObj;
                if (!rawList.isEmpty()) {
                    Object first = rawList.get(0);
                    if (first instanceof String) {
                        // List<String>
                        @SuppressWarnings("unchecked")
                        List<String> skillNames = (List<String>) skillsObj;
                        data.setSkills(skillNames);
                    } else if (first instanceof Map<?, ?>) {
                        // List<Map<String,Object>> → name 필드 추출
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> skillMapList = (List<Map<String, Object>>) skillsObj;
                        List<String> names = skillMapList.stream()
                                .map(m -> String.valueOf(m.getOrDefault("name", "")))
                                .collect(Collectors.toList());
                        data.setSkills(names);
                    }
                }
            }
        }

        req.setData(data);

        EssayConfig essay = new EssayConfig();
        essay.setQuestion("지원 동기");  // TODO: 나중에 실제 문항 문자열로 바꿀 수도 있음
        essay.setTone(coverLetter.getTone() != null ? coverLetter.getTone() : "진솔한");
        essay.setLength(
                coverLetter.getLengthPerQuestion() != null
                        ? coverLetter.getLengthPerQuestion()
                        : 1000
        );
        req.setEssay(essay);

        // 🔽🔽🔽 여기 추가된 부분: 실제로 AI로 나가는 JSON 로그 찍기 🔽🔽🔽
        try {
            ObjectMapper om = new ObjectMapper();
            String json = om.writeValueAsString(req);
            System.out.println("=== [AI REQUEST JSON] ===");
            System.out.println(json);
        } catch (Exception logEx) {
            System.out.println("=== [AI REQUEST JSON 직렬화 실패] ===");
            logEx.printStackTrace();
        }
        // 🔼🔼🔼 추가 끝 🔼🔼🔼

        AiCoverLetterResponse res = aiCoverLetterClient.generate(req);

        if (res == null || res.getCoverLetter() == null || res.getCoverLetter().isBlank()) {
            coverLetter.setStatus(CoverLetterStatus.FAILED);
            coverLetterRepository.save(coverLetter);
            throw new IllegalStateException("AI Response is empty");
        }

        Map<String, Object> updatedSections = coverLetter.getSections();
        if (updatedSections == null) updatedSections = new HashMap<>();
        updatedSections.put("generatedCoverLetter", res.getCoverLetter());
        coverLetter.setSections(updatedSections);

        // vA 도메인 메서드: SUCCESS 로 완료
        coverLetter.completeGeneration(null);
        coverLetterRepository.save(coverLetter);

    } catch (Exception e) {
        coverLetter.setStatus(CoverLetterStatus.FAILED);
        coverLetterRepository.save(coverLetter);
        throw new RuntimeException("Generation failed", e);
    }
}

// =================================================================================
// (4) 다운로드 – 실제 DOCX / PDF 파일 생성
// =================================================================================
@Override
public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
    CoverLetter coverLetter = coverLetterRepository
            .findByIdAndOwnerId(coverLetterId, userId)
            .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

    if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
        throw new IllegalStateException("Not generated yet.");
    }

    String normalized = format == null ? "" : format.toLowerCase();
    if (!normalized.equals("word") && !normalized.equals("pdf")) {
        throw new IllegalArgumentException("Unsupported format.");
    }

    // 1) 내용 가져오기
    String content;
    if (coverLetter.getSections() != null &&
            coverLetter.getSections().containsKey("generatedCoverLetter")) {
        content = String.valueOf(coverLetter.getSections().get("generatedCoverLetter"));
    } else {
        content = "내용이 없습니다.";
    }

    String fileContent = "제목: " + coverLetter.getTitle() + "\n\n" + content;

    // 2) 포맷별로 다른 바이트 생성
    byte[] bytes;
    if ("word".equals(normalized)) {
        bytes = createDocxBytes(fileContent);
    } else { // pdf
        bytes = createPdfBytes(fileContent);
    }

    return new ByteArrayResource(bytes);
}

// ================== DOCX 생성 ==================
private byte[] createDocxBytes(String text) {
    try (XWPFDocument doc = new XWPFDocument();
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

        XWPFParagraph p = doc.createParagraph();
        XWPFRun run = p.createRun();
        run.setFontFamily("Malgun Gothic"); // 한글용
        run.setFontSize(11);
        run.setText(text);

        doc.write(baos);
        return baos.toByteArray();
    } catch (IOException e) {
        throw new IllegalStateException("Failed to generate DOCX", e);
    }
}

// ================== PDF 생성 ==================
private byte[] createPdfBytes(String text) {
    try (PDDocument document = new PDDocument();
         ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        // ★ 한글 지원 폰트 로드 (resources/fonts 안에 넣어둔 TTF)
        InputStream fontStream =
                getClass().getResourceAsStream("/fonts/NanumGothic.ttf");
        if (fontStream == null) {
            throw new IllegalStateException("Font file not found: /fonts/NanumGothic.ttf");
        }
        PDType0Font font = PDType0Font.load(document, fontStream, true);

        try (PDPageContentStream contentStream =
                     new PDPageContentStream(document, page)) {

            contentStream.beginText();
            contentStream.setFont(font, 11);
            contentStream.setLeading(14.5f);
            contentStream.newLineAtOffset(50, 750);

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                contentStream.showText(line);
                contentStream.newLine();
            }

            contentStream.endText(); // ★ 이거 꼭 있어야 경고 안 뜸
        }

        document.save(baos);
        return baos.toByteArray();
    } catch (IOException e) {
        throw new IllegalStateException("Failed to generate PDF", e);
    }
}

    // =================================================================================
    // (5) 보관함 삭제
    // =================================================================================
    @Override
    @Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetterRepository.delete(coverLetter);
    }

    // =================================================================================
    // (5) 제목 수정
    // =================================================================================
    @Override
    @Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTitle(newTitle);
    }

    // =================================================================================
    // (5) 보관함 목록 조회
    //  - DTO 시그니처에 맞춰 (id, title, previewUrl, updatedAt) 4개만 사용
    // =================================================================================
    @Override
    public PageResponse<CoverLetterListItemResponse> getArchivedCoverLetters(
            Long userId,
            String q,
            String tone,
            String sort,
            int page,
            int size
    ) {
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

        Page<CoverLetter> pageResult =
                coverLetterRepository.findByOwnerIdAndArchivedTrue(userId, pageable);

        List<CoverLetterListItemResponse> content = pageResult.getContent().stream()
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

    // =================================================================================
    // 기타 유지 메서드들
    // =================================================================================
    @Override
    @Transactional
    public void updateTemplate(Long userId, Long resumeId, String templateId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));
        coverLetter.updateTemplate(templateId);
    }

    @Override
    @Transactional
    public void updateGeneratedContent(Long userId, Long coverLetterId, String content) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        Map<String, Object> sections = coverLetter.getSections();
        if (sections == null) sections = new HashMap<>();
        sections.put("generatedCoverLetter", content);
        coverLetter.setSections(sections);
        coverLetterRepository.save(coverLetter);
    }

    @Override
    @Transactional
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));
        coverLetter.setArchived(true);
    }
}
