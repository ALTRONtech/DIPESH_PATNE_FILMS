# Photography Business Management System

Portfolio website for **Dipesh Patne Photography & Videography** with a
Django + MongoDB backend that stores and manages website enquiries.

## Project structure

```
frontend/                        # static portfolio site (HTML/CSS/JS)
├── index.html                   # one-page site: hero, about, gallery, services, video, contact
├── style.css                    # dark editorial theme + animations
├── script.js                    # UI interactions + enquiry API integration
└── images/                      # portfolio photographs

photography_business_backend/    # Django REST API backed by MongoDB
├── api/                         # views, serializers, JWT auth, Mongo helpers
├── config/                      # Django project settings
├── scripts/create_admin.py      # creates/updates the admin login
├── frontend-integration/        # copy of the frontend script that talks to this API
└── requirements.txt
```

## Requirements

- Python 3.10+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## Run the backend

```bash
cd photography_business_backend
python -m venv .venv
# Windows:  .\.venv\Scripts\Activate.ps1      macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt

# configure (defaults work with a local MongoDB on the default port)
copy .env.example .env          # then edit secrets if you want

python scripts/create_admin.py   # create the admin login (username + password)
python manage.py runserver       # http://127.0.0.1:8000
```

Verify with `http://127.0.0.1:8000/api/health/` →
`{"status":"ok","database":"connected"}`.

## Run the frontend

Open `frontend/index.html` in a browser, or serve the folder with any static
server (e.g. VS Code Live Server → `http://127.0.0.1:5500`).

The contact form posts to the backend at `http://127.0.0.1:8000/api` (see
`API_BASE` in `frontend/script.js`) and then opens WhatsApp with the enquiry
prefilled. If the backend is offline, the form still opens WhatsApp so no
enquiry is lost.

## API endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/health/` | – | database health check |
| POST | `/api/enquiries/` | – | public website enquiry form |
| POST | `/api/auth/login/` | – | get JWT token |
| GET | `/api/auth/me/` | JWT | verify token |
| GET | `/api/admin/enquiries/` | JWT | list enquiries |
| PATCH | `/api/admin/enquiries/<id>/` | JWT | update status (`new`, `contacted`, `confirmed`, `closed`) |
| DELETE | `/api/admin/enquiries/<id>/` | JWT | delete enquiry |
| GET | `/api/dashboard/` | JWT | enquiry summary counts |

## Security notes

College-project starter, not a production deployment. Before publishing
publicly: use HTTPS, rotate the secrets in `.env`, set `DEBUG=False`, restrict
`ALLOWED_HOSTS` and CORS origins, add throttling/spam protection, and never
commit `.env`.
