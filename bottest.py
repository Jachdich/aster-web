import sys
sys.path.append("..")
import aster.asterpy.src.asterpy as asterpy

client = asterpy.Client("localhost", 2345, "JingKellyfish", "", 6895244034031013013)

@client.event
def on_message(message):
    client.get_channel_by_name("bugs").send(message.content + " asdf")

@client.event
def on_ready():
    print("Ready!")

client.run()
