# TerebeSPY
***A simple, yet effective tool to capture image requests for whatever purposes you like***

> By default it will start on the 5000 port

## Installation
1. Install python (possibly 3.0)
2. Install Flask
3. Run the server.py file (in cmd/terminal: `python server.py`)

## Usage
- For you the link is accessible through `localhost:5000/pixel/PIXEL_ID`
- Change the **PIXEL_ID** to an arbitrary id that will get logged
- For security reasons, the ID is limited to max **5** characters, only numbers and a-z A-Z
- For the outside world, you'll need to provide the ip, and make sure to port-forward!
- Find each log in the `/logs` folder
> Note: You could change the default port in `server.py`

> **Most importantly: have fun?! I guess...**
