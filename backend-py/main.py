# write a basic Flask server
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# use blueprints to organize the code
# assume I have a blueprint called 'ai'
from ai import ai
app.register_blueprint(ai, url_prefix='/ai')

if __name__ == '__main__':
    app.run(debug=True)