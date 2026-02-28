from flask import Flask, render_template, request, send_file, redirect, abort, make_response
from datetime import datetime
import os, threading, json, hashlib, string, random, re

accessed = []
logs = {}

def has_access(ip):
    return ip in accessed

def grant_access(ip):
    if ip not in accessed:
       accessed.append(ip)
       
def revoke_access(ip):
    if ip in accessed:
        accessed.remove(ip)

try:
    with open('config.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
        print('Successfully loaded configurations!')
except Exception as e:
    print(f'Failed to load config file!', e)
    exit(1)

try:
    with open('logs.json', 'r', encoding='utf-8') as f:
        logs = json.load(f)
except Exception:
    print(f'Failed to load logs file!')

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    if has_access(request.remote_addr):
        return redirect('/admin')
    
    return render_template('login.html')

@app.route('/', methods=['POST'])
def index_post():
    try:
        username = request.form.get('username', None)
        password = request.form.get('password', None)
        
        if not username or not password:
            raise Exception
        
        username = username.strip()
        password = password.strip()
        
        # Check against empty whitespaces
        if not username or not password:
            raise Exception

        hashed_password = hashlib.sha256(str(config['password_salt'] + password).encode('utf-8')).hexdigest()

        if username != config['admin_username'] or hashed_password != config['password_hash']:
            return render_template('login.html', error='Incorrect username-password pair. Check for typos!', username=username, password=password)
        
        grant_access(request.remote_addr)
        return redirect('/admin')
    except Exception:
        return render_template('login.html', error='Invalid request! (400)')

@app.route('/admin')
def admin():
    if not has_access(request.remote_addr):
        return redirect('/')
    
    return render_template('admin.html')

@app.route('/config', methods=['GET'])
def config_page():
    if not has_access(request.remote_addr):
        return redirect('/')
    
    return render_template('config.html', config=config)

@app.route('/config', methods=['POST'])
def config_page_post():
    if not has_access(request.remote_addr):
        abort(401)
        
    def handle_checkbox(val,):
        return val == 'on'
        
    try:
        data = request.form
        server_port = data.get('server_port', config['server_port'])
        server_debug = handle_checkbox(data.get('server_debug', None))
        play_sound = handle_checkbox(data.get('play_sound', None))
        admin_username = data.get('admin_username', config['admin_username'])
        new_password = data.get('password', None)
        
        if not server_port.isdigit() or not (100 < int(server_port) < 65535):
            return render_template('config.html', config=config, error='Server port invalid!')
        
        config['server_port'] = server_port
        config['server_debug'] = server_debug
        config['play_sound'] = play_sound
        config['admin_username'] = admin_username

        if new_password:
            all = string.ascii_letters + string.digits
            salt = ''.join([all[random.randrange(len(all))] for _ in range(12)])
            
            config['password_salt'] = salt
            config['password_hash'] = hashlib.sha256((salt + new_password).encode('utf-8')).hexdigest()
            
        with open('config.json', 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=4)
    except:
        return render_template('config.html', config=config, error='Invalid request! (400)')
    
    return render_template('config.html', config=config)

@app.route('/pixel.png')
def pixel():
    id = request.args.get('id', None)

    if not id or not id.isalnum():
        abort(400)
    
    if id not in logs:
        abort(404)
    
    log_to(id)
    print(f'HIT! id: {id} triggered by {request.remote_addr} at {datetime.now().strftime("%Y-%m-%d %H:%M:%S:%f")}')
    
    if config['play_sound']:
       threading.Thread(target=os.startfile, args=(os.path.join(os.getcwd(), 'src/alarm.wav'),), daemon=True).start()
       
    response = make_response(send_file("src/pixel.png"))
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.route('/signout', methods=['GET', 'POST'])
def signout():
    revoke_access(request.remote_addr)
    return redirect('/')

@app.route('/api', methods=['POST'])
def api():
    if not has_access(request.remote_addr):
        return 'Unauthorized access!', 401
        
    try:
        data = request.get_json()
        action = data.get('action', None)
        
        match action:
            case 'log_list':
                id = data.get('id', None)
                
                if id:
                    log = logs.get(id, None)
                    
                    if log is None:
                        return 'No "log" parameter defined!', 400
                    
                    return json.dumps(log), 200
                else:
                    return {k: len(v) for k,v in logs.items()}
            case 'pixel':
                id = data.get('id', None)
                
                if not id:
                    return 'No "id" parameter defined!', 400
                if not (1 <= len(id) <= 20):
                    return '"id" parameter too long!', 400
                if re.match(r'[^0-9a-zA-Z]', id):
                    return '"id" parameter contains invalid characters!', 400
                if id in logs:
                    return 'Pixel with that id already exists!', 400
                
                logs[id] = []
                save_logs()
                return 'OK', 201
            case 'delete':
                id = data.get('id', None)
                
                if not id:
                    return 'No "id" parameter defined!', 400
                if id not in logs:
                    return "Pixel with that id doesn't exists!", 404

                logs.pop(id, None)
                save_logs()
                return 'OK', 200
            case _:
                return 'Unknown action!', 400
        
    except:
        return 'Internal server error!', 500

def log_to(pid):    
    logs[pid].append({
        'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S:%f"),
        'ip': request.remote_addr,
        'useragent': request.headers.get('User-Agent'),
        'path': request.full_path,
        'host': request.headers.get('Host')
    })
    
    save_logs()
    
def save_logs():
    try:
        with open('logs.json', 'w', encoding='utf-8') as f:
            json.dump(logs, f, ensure_ascii=False)
    except Exception:
        print(f'Failed to save logs!')

if __name__ == '__main__':
    app.run('0.0.0.0', port=config['server_port'], debug=config['server_debug'])