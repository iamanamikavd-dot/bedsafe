from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# ==========================
# Configuration
# ==========================

app.config["SECRET_KEY"] = "bedsafe_secret_key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ==========================
# Database Model
# ==========================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)

# ==========================
# Home Page
# ==========================

@app.route("/")
def home():
    return render_template("home.html")

# ==========================
# Register
# ==========================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        full_name = request.form["full_name"]
        email = request.form["email"]
        phone = request.form["phone"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password != confirm_password:
            return "Passwords do not match!"

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            return "Email already registered!"

        new_user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            password=password
        )

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for("login"))

    return render_template("register.html")

# ==========================
# Login
# ==========================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(
            email=email,
            password=password
        ).first()

        if user:
            return "Login Successful!"

        return "Invalid Email or Password!"

    return render_template("login.html")

# ==========================
# Create Database
# ==========================

with app.app_context():
    db.create_all()

# ==========================
# Run Server
# ==========================

if __name__ == "__main__":
    app.run(debug=True)