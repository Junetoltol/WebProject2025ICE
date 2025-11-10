AI Resume/Cover Letter Service


## Quickstart
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # 키 채우기
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000