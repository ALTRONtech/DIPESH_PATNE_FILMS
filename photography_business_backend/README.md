# Photography Business Management System — Django + MongoDB

This backend is designed to connect to the existing Dipesh Patne Photography portfolio. It stores website enquiries in MongoDB and provides a small protected API for managing enquiry status and viewing dashboard counts.

## Requirements
- Python 3.10+
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup (Windows PowerShell)
1. Install Python and MongoDB, or create a MongoDB Atlas database.
2. Open this backend folder in a terminal.
3. Create and activate a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

4. Install packages:

   ```powershell
   pip install -r requirements.txt
   ```

5. Copy `.env.example` to `.env` and set strong random values for `DJANGO_SECRET_KEY` and `JWT_SECRET_KEY`. Set `MONGODB_URI` if using Atlas.
6. Create the admin login:

   ```powershell
   python scripts/create_admin.py
   ```

7. Start Django:

   ```powershell
   python manage.py runserver
   ```

8. Check `http://127.0.0.1:8000/api/health/`. It should return `{"status":"ok","database":"connected"}`.

## Connect your existing frontend
- Keep `index.html`, `style.css`, and `script.js` together.
- Open the frontend using VS Code Live Server, usually `http://127.0.0.1:5500`.
- The included updated `script.js` submits enquiries to `POST http://127.0.0.1:8000/api/enquiries/`.
- On a successful save, the form opens WhatsApp as before. If the backend is unreachable, the form still opens WhatsApp as a fallback.
- Update `API_BASE` and the WhatsApp number in `script.js` if needed.

## API endpoints
- `GET /api/health/` — database health check
- `POST /api/enquiries/` — public website enquiry form
- `POST /api/auth/login/` — get JWT token
- `GET /api/auth/me/` — verify token
- `GET /api/admin/enquiries/` — list enquiries (JWT required)
- `PATCH /api/admin/enquiries/<id>/` — update status to `new`, `contacted`, `confirmed`, or `closed` (JWT required)
- `DELETE /api/admin/enquiries/<id>/` — delete enquiry (JWT required)
- `GET /api/dashboard/` — enquiry summary counts (JWT required)

## Example request
```json
{
  "name": "Aarav Sharma",
  "phone": "9876543210",
  "service": "Wedding Photography",
  "message": "Please share availability for 18 December."
}
```

## Security notes
This is a college-project starter, not a production deployment. Before publishing publicly, use HTTPS, rotate secrets, set `DEBUG=False`, restrict `ALLOWED_HOSTS` and CORS origins, add request throttling and spam protection, and never commit `.env`. The admin endpoints require JWT authentication.
