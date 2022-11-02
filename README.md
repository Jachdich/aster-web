# Aster web client

This is a project for the aster web client server (confusing name, I know). It's a web server that is, confusingly, an aster client at the same time. Basically just a web interface for aster that receives commands from the browser via web sockets and forwards them to Aster servers. Some of the logic is handled on the web server instead of strictly forwarding messages, which basically just means I don't have to do so much javascript (and also it can then use the [aster-py](https://github.com/Jachdich/asterpy) library for convenience).

# Usage

Not really sure how to run it properly rn (I am not experienced with web dev lol) but to run it in debug mode you need [aster-py](https://pypi.org/project/asterpy/), flask and flask_socketio; then you can just run `main.py` and it should work. Default URL is /aster on port 5000.

# TODO

- release builds
- support HTTPS
- a whooolee bunch of other things to fully support the aster protocol
