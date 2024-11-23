from flask import Flask, render_template, request, jsonify
import pandas as pd
import os, tempfile

# implied xlrd installed

from livereload import Server

DB = os.path.join('media', 'attendance.xlsx')
FIELDS_FE = ['Emp No.', 'AC-No.', 'Name', 'Date', 'Clock In', 'Clock Out']

app = Flask(__name__)

@app.route("/")
def index():
    df = pd.read_excel(DB)
    current_data = df[FIELDS_FE].to_json()
    return render_template('index.html', current_data=current_data)

@app.route("/upload-attendance", methods=["POST"])
def process_attendance():
    if request.method == "POST":
        # Get the uploaded file and save it temporarily
        file = request.files['file-upload']
        extension = file.filename.split('.')[-1]
        new_data_fn = os.path.join(tempfile.gettempdir(), 'new-data.' + extension)
        file.save(new_data_fn)

        # Read as DF from the uploaded file
        if extension == 'xls':
            new_data = pd.read_excel(new_data_fn, engine='xlrd')
        elif extension == 'xlsx':
            new_data = pd.read_excel(new_data_fn)
        elif extension == 'csv':
            new_data = pd.read_excel(new_data_fn)
        else:
            return jsonify({'message': f'{extension} is unsupported file format'}), 200

        # Read current existing data
        if os.path.isfile(DB):
            old_data = pd.read_excel(DB)
            new_data = pd.concat((new_data, old_data))

        # Write as current data
        new_data.to_excel(DB, index=False)

        return jsonify({'message': 'OK'}), 200
    return "Wrong method."


if app.debug:
    server = Server(app.wsgi_app)
    server.watch('templates/', 'static/')
    server.serve()
