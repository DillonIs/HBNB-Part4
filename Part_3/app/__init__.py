""" Constructor for the 'app' module """
from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns
from flask_cors import CORS

def create_app():
    """ method used to create an app instance """

    app = Flask(__name__)

    # Need to add CORS so that we can do API calls in Part 4
    CORS(app, resources={r"/api/v1/*": {"origins": "*"}})
    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API')

    # Register the namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protected')

    app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Use a strong and unique key in production
    jwt = JWTManager(app)

    return app
import os
from flask import Flask, Blueprint
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns

BASE_DIR = os.path.dirname(os.path.abspath(__file__))        # .../Part_3/app
TEMPLATE_DIR = os.path.join(BASE_DIR, '..', 'templates')     # .../Part_3/templates
STATIC_DIR   = os.path.join(BASE_DIR, '..', 'static')        # .../Part_3/static

def create_app():
    app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

    CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

    # Mount RESTX on a blueprint with a prefix, so nothing touches '/'
    api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
    api = Api(
        api_bp,
        version="1.0",
        title="HBnB API",
        description="HBnB Application API",
        doc=False,  # set to "/swagger" later once root is clean
    )

    api.add_namespace(users_ns,     path="/users")
    api.add_namespace(amenities_ns, path="/amenities")
    api.add_namespace(places_ns,    path="/places")
    api.add_namespace(reviews_ns,   path="/reviews")
    api.add_namespace(auth_ns,      path="/auth")
    api.add_namespace(protected_ns, path="/protected")

    app.register_blueprint(api_bp)

    app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"
    JWTManager(app)
    return app