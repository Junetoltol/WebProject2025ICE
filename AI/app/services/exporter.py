from docx import Document
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from pathlib import Path


# ============================================================
# AI 자소서/이력서 내보내기 모듈
# (DOCX / PDF 형식으로 결과 저장)
# ============================================================

# 내보내기 파일을 저장할 임시 디렉터리 경로 설정
EXPORT_DIR = Path("/tmp/exports")
# 경로가 없을 경우 자동 생성 (서버 실행 시 한 번만 수행됨)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def export_docx(text: str, filename: str) -> str:
    """
    텍스트를 .docx 문서로 저장한다.

    매개변수:
        text (str): 저장할 본문 문자열 (문단 구분은 \n\n)
        filename (str): 생성할 파일 이름 (확장자 포함)

    반환값:
        str: 실제 생성된 DOCX 파일의 절대경로

    동작 방식:
        1. /tmp/exports/ 경로 하위에 DOCX 파일 생성
        2. 문단 구분(\n\n)을 기준으로 Paragraph 단위 추가
        3. Document 객체로 파일 저장
    """
    path = EXPORT_DIR / filename
    doc = Document()
    for line in text.split("\n\n"):  # 문단 단위 분리 후 추가
        doc.add_paragraph(line)
    doc.save(path)
    return str(path)


def export_pdf(text: str, filename: str) -> str:
    """
    텍스트를 .pdf 파일로 내보낸다.

    매개변수:
        text (str): 저장할 본문 문자열 (문단 구분은 \n\n)
        filename (str): 생성할 파일 이름 (확장자 포함)

    반환값:
        str: 실제 생성된 PDF 파일의 절대경로

    동작 방식:
        1. ReportLab을 이용하여 A4 용지 크기의 PDF 생성
        2. 문단 구분(\n\n)을 기준으로 Paragraph 단위 변환
        3. 내부 줄바꿈(\n)은 <br/> 태그로 변환하여 반영
        4. 완성된 story 리스트를 SimpleDocTemplate으로 빌드
    """
    path = EXPORT_DIR / filename
    styles = getSampleStyleSheet()  # 기본 스타일 불러오기
    # 문단 단위로 Paragraph 객체 생성 (HTML 태그 <br/> 허용)
    story = [Paragraph(p.replace("\n", "<br/>"), styles["Normal"]) for p in text.split("\n\n")]
    # PDF 문서 템플릿 설정
    pdf = SimpleDocTemplate(str(path), pagesize=A4)
    # PDF 파일 생성
    pdf.build(story)
    return str(path)
