# TerebeSPY
***A simple, yet effective tool to capture image requests for whatever purposes you like***

## I. Installation
1. Install python (possibly 3.0)
2. Install Flask via pip or other tools (E.g: `pip install flask`)
3. Run the server.py file (in cmd/terminal: `python server.py`)

## II. Usage
### 1. Basic setup
- Once you run the server, it can be accesed under the `http://localhost:5000` url
- **By default the server starts on the `5000` port, but you can change this later in this section
- After visiting the site you're required to log in
- **The default user is `admin` with the password: `terebespy`**
- By clicking on the security tab on the left side you can change the password and the server port too
>[!CAUTION]
> It is recommended to change the password, because it's easy to gain access with the default password!

### 2. Create a tracking pixel
1. Visit the `Logs` tab
2. And click on the button `Create first pixel`
3. It'll bring up a smaller window, inside it enter the pixel id
> If an error appears, visit the **Common errors** section
5. Click the `Create pixel` button
6. Copy the id under the pixel id field. If you already closed it, you can copy it too from the log
7. And done, you could visit the url you'd copied

### 3. Opening it to the public
What would be the point for tracking pixels, if only you can access it? So this is why we have to open it to the internet.
1. Make sure you port-forward the port your server is configured to (by default it's on the `5000` port)
2. For your LAN it can be accessed via your private ip address
3. But for other people, you have to use your **public** ip, that you can easily acquire:

>[!NOTE]
> Example for private ips: `http://192.168.1.20:5000`,
>
> And for the public ones: `http://123.234.156.178:5000`

And that's it. You have set up the server that you could use for whatever purposes you like

## III. Common erros / FAQ
### Missing packages
If you get an error saying it can't find flask or any other package, you have to install it via pip
### I enter the localhost url, but nothing shows up
You have possibly mistyped the port, or it's set to another one in the server's config (again by default it starts on the `5000` port)
If you forgot it, you can look it up in the `config.json` file under the `server_port` field.
### Incorrect username-password pair
As it says, you entered the wrong username or password into the textfields when trying to log in
If you believe you forgot the password, visit the next paragraph
### I forgot my password
If you forgot your password, and want to reset it, it's as easy as going to the repo and finding the `config.json` file, then copy the values for `password_salt` and `password_hash`, then you have to find the same config file in server's folder, open it and paste the values into their respective fields. Yes, easy as 1-2-3
### Pixel with that id already exists
As it says, you tried to create a pixel with an id, that already exists.
It could happen by double-clicking on the `Create pixel` button.
Otherwise choose a different id.
### Server port invalid
This happens when you try to enter a server port that contains anything besides digits.
**Even a tiny space character could mess it up**
### I get a 404: Not found when visiting a pixel
This usually happens if you entered in a url that has a pixel it not yet registered in the server.

**Make sure you have typed it in correctly.** Or create a new pixel with that id.
### Nothing loads in when visiting a pixel
This is a common user error. If you copy the pixel's link from the page, but you access that page from `localhost` or your private ip, then for someone outside your LAN will not have access to it.

**So make sure if you copy it with the button - you must replace it with the public ip**

>[!NOTE]
> **Example:**
>
> You copied the link: `http://192.168.1.20:5000/pixel.png?id=test`
>
> Then you should replace it to include you public ip: `http://123.234.156.178:5000/pixel.png?id=test`

### Most importantly, ENJOY
That's it for now. I may expand this and the project later.
