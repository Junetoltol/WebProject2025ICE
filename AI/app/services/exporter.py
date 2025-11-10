from docx import Document
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from pathlib import Path


EXPORT_DIR = Path("/tmp/exports")
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def export_docx(text: str, filename: str) -> str:
    path = EXPORT_DIR / filename
    doc = Document()
    for line in text.split("\n\n"):
        doc.add_paragraph(line)
    doc.save(path)
    return str(path)


def export_pdf(text: str, filename: str) -> str:
    path = EXPORT_DIR / filename
    styles = getSampleStyleSheet()
    story = [Paragraph(p.replace("\n", "<br/>"), styles["Normal"]) for p in text.split("\n\n")]
    pdf = SimpleDocTemplate(str(path), pagesize=A4)
    pdf.build(story)
    return str(path)
