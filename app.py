from flask import Flask, render_template, request, jsonify

from datetime import datetime
import pandas as pd
import os, tempfile

# implied xlrd installed

DB = os.path.join('media', 'attendance.xlsx')
FIELDS_FE = ['Emp No.', 'AC-No.', 'Name', 'Date', 'Clock In', 'Clock Out']

app = Flask(__name__)


@app.route("/")
def index():
    current_data = jsonify({})
    if os.path.isfile(DB):
        # Get the full DB
        df = pd.read_excel(DB)
        current_data = df[FIELDS_FE].to_json(orient='records')

        # Filter by unique Employee IDs and get their names
        employees_unique = df['Emp No.'].unique()
        names = [
            df[  df['Emp No.'] == eid  ]['Name'].unique()[0]
                for eid in employees_unique
        ]

        # Start and End Date
        _strpdate = lambda date_s: datetime.strptime(date_s, '%d-%b-%y').date()
        min_date = min(df['Date'], key=_strpdate)
        max_date = max( df['Date'], key=_strpdate)
        
        # Now format them as 'yyyy-mm-dd'
        min_max_date = (
            _strpdate(min_date).strftime('%Y-%m-%d'),
            _strpdate(max_date).strftime('%Y-%m-%d'),
        )

    # TODO: send only the current_data from the backend. Use lodash in FE to
    # process data client side
    return render_template('index.html', current_data=current_data, names=names, min_max_date=min_max_date)


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
        elif extension == 'ods':
            new_data = pd.read_excel(new_data_fn)
        elif extension == 'csv':
            new_data = pd.read_csv(new_data_fn)
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


#if app.debug:
#    from livereload import Server
#    server = Server(app.wsgi_app)
#    server.watch('templates/', 'static/')
#    server.serve()
