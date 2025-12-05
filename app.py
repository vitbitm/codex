import os
import sqlite3
from datetime import datetime
from functools import wraps

from flask import Flask, g, redirect, render_template, request, session, url_for, flash
from werkzeug.security import check_password_hash, generate_password_hash

DATABASE = os.path.join(os.path.dirname(__file__), "app.db")
SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-secret")
DEFAULT_ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    @app.before_request
    def load_db():
        g.db = get_db()

    @app.teardown_request
    def close_db(exception):
        db = getattr(g, "db", None)
        if db is not None:
            db.close()

    init_db()

    def login_required(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if "user_id" not in session:
                return redirect(url_for("login"))
            return view(*args, **kwargs)

        return wrapped

    def admin_required(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if not session.get("is_admin"):
                flash("Требуются права администратора", "error")
                return redirect(url_for("dashboard"))
            return view(*args, **kwargs)

        return wrapped

    @app.route("/")
    @login_required
    def dashboard():
        user_id = session["user_id"]
        is_admin = session.get("is_admin", False)
        db = g.db
        if is_admin:
            tasks = db.execute(
                """
                SELECT tasks.id, title, description, status, assignee_id, users.username as assignee,
                       tasks.created_at
                FROM tasks
                LEFT JOIN users ON users.id = tasks.assignee_id
                ORDER BY tasks.created_at DESC
                """
            ).fetchall()
        else:
            tasks = db.execute(
                """
                SELECT tasks.id, title, description, status, assignee_id, users.username as assignee,
                       tasks.created_at
                FROM tasks
                LEFT JOIN users ON users.id = tasks.assignee_id
                WHERE assignee_id = ? OR creator_id = ?
                ORDER BY tasks.created_at DESC
                """,
                (user_id, user_id),
            ).fetchall()

        teammates = db.execute("SELECT id, username FROM users ORDER BY username").fetchall()
        return render_template(
            "dashboard.html",
            tasks=tasks,
            teammates=teammates,
            user=session.get("username"),
            is_admin=is_admin,
        )

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            db = g.db
            user = db.execute(
                "SELECT id, username, password_hash, role FROM users WHERE username = ?",
                (username,),
            ).fetchone()
            if user and check_password_hash(user["password_hash"], password):
                session["user_id"] = user["id"]
                session["username"] = user["username"]
                session["is_admin"] = user["role"] == "admin"
                return redirect(url_for("dashboard"))
            flash("Неверное имя пользователя или пароль", "error")
        return render_template("login.html")

    @app.route("/logout")
    def logout():
        session.clear()
        return redirect(url_for("login"))

    @app.route("/tasks", methods=["POST"])
    @login_required
    def create_task():
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        assignee_id = request.form.get("assignee_id")
        status = request.form.get("status", "Pending")
        if not title:
            flash("Заголовок обязателен", "error")
            return redirect(url_for("dashboard"))

        db = g.db
        db.execute(
            """
            INSERT INTO tasks (title, description, status, assignee_id, creator_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                title,
                description,
                status,
                int(assignee_id) if assignee_id else None,
                session["user_id"],
                datetime.utcnow().isoformat(),
            ),
        )
        db.commit()
        flash("Задача создана", "success")
        return redirect(url_for("dashboard"))

    @app.route("/tasks/<int:task_id>/status", methods=["POST"])
    @login_required
    def update_task_status(task_id):
        status = request.form.get("status")
        if status not in {"Pending", "In Progress", "Done"}:
            flash("Недопустимый статус", "error")
            return redirect(url_for("dashboard"))

        db = g.db
        db.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
        db.commit()
        flash("Статус обновлен", "success")
        return redirect(url_for("dashboard"))

    @app.route("/admin/users", methods=["GET", "POST"])
    @login_required
    @admin_required
    def manage_users():
        db = g.db
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            role = request.form.get("role", "member")
            if not username or not password:
                flash("Имя пользователя и пароль обязательны", "error")
            else:
                try:
                    db.execute(
                        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                        (username, generate_password_hash(password), role),
                    )
                    db.commit()
                    flash("Пользователь создан", "success")
                except sqlite3.IntegrityError:
                    flash("Пользователь с таким именем уже существует", "error")

        users = db.execute("SELECT id, username, role FROM users ORDER BY username").fetchall()
        return render_template("admin_users.html", users=users)

    return app


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        g._database = db
    return db


def init_db():
    db = sqlite3.connect(DATABASE)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role in ('admin', 'member'))
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            assignee_id INTEGER,
            creator_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (assignee_id) REFERENCES users (id),
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )
        """
    )
    db.commit()

    admin = db.execute("SELECT id FROM users WHERE username = ?", (DEFAULT_ADMIN_USER,)).fetchone()
    if not admin:
        db.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
            (DEFAULT_ADMIN_USER, generate_password_hash(DEFAULT_ADMIN_PASSWORD)),
        )
        db.commit()


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
