from flask import Flask, render_template

import os
tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

app = Flask(__name__, template_folder=tmpl_dir)

@app.route('/')

def home():
	return render_template('./index.html')


if __name__ == '__main__':
	app.run(debug=True)