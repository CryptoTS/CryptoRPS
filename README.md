# CryptoRPS
## Setup local server via Python (full functionality requires HTTPS)
Open up any terminal.
Check what version of Python you have by running:
```
python -V
```
If you don't have Python, install it at: https://www.python.org/downloads/
You'll need ngrok for easy https: first part of (use choco) https://www.twilio.com/docs/guides/how-use-ngrok-windows-and-visual-studio-test-webhooks#installing-ngrok-on-windows

NOTE: Command Line will need to be re-opened to be able to use ngrok
<br />

In command line, naviage to the location of the website's files. Then spin up a local server from that location:

<br />

If you have **Python 2.X** run the command:
```
python -m SimpleHTTPServer 8501
```

If you have **Python 3.X** run the command:
```
python -m http.server 8501
```

Now tunnel ngrok https through that http server by openeing command line and running:
```
ngrok http 8501
```


<br /><br />
You now have a local HTTPS server running on port 8501. Go to http://127.0.0.1:4040/status to see the url assigned to the website and use that url in accessing server!
