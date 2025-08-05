from app import create_app
from flask import Flask, render_template
from flask_restx import Api
from flask_jwt_extended import JWTManager
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns
from flask_cors import CORS

# app = create_app()

app = Flask(__name__)

# Default index route no longer shows Swagger
@app.route('/')
def index():
    """ Landing page for the site """
    # you MUST have the 'templates' and 'static' folders

    return render_template('index.html')

# Need to add CORS so that we can do API calls in Part 4
# Note the doc parameter in the Api() function call. This is path where the swagger will be located from now on.
CORS(app, resources={r"/api/v1/*": {"origins": "*"}})
api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/swagger')

# Register the namespaces
api.add_namespace(users_ns, path='/api/v1/users')
api.add_namespace(amenities_ns, path='/api/v1/amenities')
api.add_namespace(places_ns, path='/api/v1/places')
api.add_namespace(reviews_ns, path='/api/v1/reviews')
api.add_namespace(auth_ns, path='/api/v1/auth')
api.add_namespace(protected_ns, path='/api/v1/protected')

app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Use a strong and unique key in production
jwt = JWTManager(app)

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='localhost', port=5000, debug=True)
