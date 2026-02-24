from flask import Flask, Response, request, send_file
import re
from datetime import datetime
import os

#   !!!  CONFIGURATION  !!!
server_port = 5000         # The port to run the server on
server_debug = False       # Whether to run the server in debug mode
play_sound = False         # Whether to play an alarm sound if a request is triggered
max_id_length = 5          # Max characters in a pixel id, for easy-of-use keep it at 5

app = Flask(__name__)

@app.route('/')
def index():
    resp = Response('<h1>You sucessfully reached the server :D</h1><p>I hope you like it')
    resp.status_code = 200
    resp.content_type = 'text/html; charset=utf-8'
    return resp

@app.route('/pixel/<pid>')
def pixel(pid):
    if len(pid) > max_id_length or len(pid) < 1:
        return 'Bad request', 400

    pid = re.sub(r'[^0-9a-z]', '', pid)
    
    log_to(pid)
    print(f'{request.remote_addr} got caught onto the hook')
    
    if play_sound:
       os.startfile('alarm.wav')
       
    return send_file('src/pixel.png')

def log_to(pid):
    with open(f'logs/log_{pid}.log', 'a', encoding='utf-8') as f:
        f.write('REQUEST ---\n')
        f.write(f'DATE: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')
        f.write(f'IP: {request.remote_addr}\n')
        f.write(f'USERAGENT: {request.headers.get('User-Agent')}\n')
        f.write(f'PATH: {request.full_path}\n')
        f.write(f'HOST: {request.headers.get('Host')}\n\n')

if __name__ == '__main__':
    app.run('0.0.0.0', port=server_port, debug=server_debug)