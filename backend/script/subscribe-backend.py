from flask import Flask, request
import json
import logging
import os
import sys
import paho.mqtt.client as mqtt
from pathlib import Path
import queue
import ssl
import threading
import urllib3
from urllib.parse import urlsplit
import argparse

# LOGGER
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    level=logging.DEBUG,
    datefmt="%Y-%m-%d %H:%M:%S"
)
LOGGER = logging.getLogger(__name__)

# Global variables
urlQ = queue.Queue()
http = urllib3.PoolManager()


# Creates the Flask app to handle the subscription
def create_app(broker, subs, download_dir, client, test_config=None):
    LOGGER.debug("Creating app")
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    # Check if the directory exists and is writable before
    # starting the download thread
    if (os.path.exists(download_dir) and
            os.access(download_dir, os.W_OK)):
        downloadThread = threading.Thread(
            target=downloadWorker, args=(subs, download_dir), daemon=True)
        downloadThread.start()
    else:
        raise FileNotFoundError("Specified download directory does not exist or is not writable.")  # noqa

    @app.route('/wis2/subscriptions/list')
    def list_subscriptions():
        return subs

    @app.route('/wis2/subscriptions/add')
    def add_subscription():
        topic = request.args.get('topic', None)
        if topic is None:
            return "No topic passed"
        else:
            if topic in subs:
                LOGGER.debug(f"Topic {topic} already subscribed")
            else:
                client.subscribe(f"{topic}")
                subs[topic] = download_dir
        return subs

    @app.route('/wis2/subscriptions/delete')
    def delete_subscription():
        topic = request.args.get('topic', None)
        if topic is None:
            return "No topic passed"
        else:
            client.unsubscribe(f"{topic}")
            LOGGER.info(f"{topic}/#")
            if topic in subs:
                del subs[topic]
            else:
                LOGGER.info(f"Topic {topic} not found")
                for sub in subs:
                    LOGGER.info(sub, topic)
        return subs

    return app


def downloadWorker(subs, download_dir):
    # Declare global variables
    global urlQ
    global http

    # Continuously check for new jobs in the queue to download
    while True:
        LOGGER.debug(f"Messages in queue: {urlQ.qsize()}")
        job = urlQ.get()
        output_dir = subs.get(job['topic'])
        if output_dir is None:
            output_dir = download_dir
        output_dir = Path(output_dir)
        # get data ID, used to set directory to write to
        dataid = Path(job['payload']['properties']['data_id'])
        # we need to replace colons in output path
        dataid = Path(str(dataid).replace(":", ""))
        output_path = Path(output_dir, dataid)
        # create directory
        output_path.parent.mkdir(exist_ok=True, parents=True)
        LOGGER.info(output_path.parent)
        # find canonical in links
        for link in job['payload']['links']:
            if link['rel'] == "canonical":
                path = urlsplit(link['href']).path
                filename = os.path.basename(path)
                LOGGER.debug(f"{filename}")
                # check if already in output directory, if not download
                if not output_path.is_file():
                    LOGGER.debug(f"Downloading {filename}")
                    try:
                        response = http.request("GET", link['href'])
                    except Exception as e:
                        LOGGER.error(f"Error downloading {link['href']}")
                        LOGGER.error(e)
                    try:
                        output_path.write_bytes(response.data)
                    except Exception as e:
                        LOGGER.error(f"Error saving to disk: {download_dir}/{filename}")  # noqa
                        LOGGER.error(e)

        urlQ.task_done()


# MQTT stuff (currently unused)
def on_connect(client, userdata, flags, rc):
    LOGGER.debug("Connected")


# MQTT stuff
def on_message(client, userdata, msg):
    # Declare urlQ as global
    global urlQ

    LOGGER.debug("Message received")
    # create new job and add to queue
    job = {
        'topic': msg.topic,
        'payload': json.loads(msg.payload)
    }
    urlQ.put(job)


# MQTT stuff (currently unused)
def on_subscribe(client, userdata, mid, granted_qos):
    LOGGER.debug(("On subscribe"))


def main():
    # Parse system argument: the directory of the configuration file
    parser = argparse.ArgumentParser(
        description="WIS2 Downloader Backend Configuration")
    parser.add_argument(
        "--config", default=None,
        help="The absolute directory of the configuration file")
    args = parser.parse_args()

    # Determine base path of application
    if getattr(sys, 'frozen', False):
        # If the application is run as a bundled executable,
        # the sys.executable path will be the path to
        # the application executable
        application_path = os.path.dirname(sys.executable)
    else:
        # If it's run as a normal Python script, the sys.executable
        # path will be the path to the Python interpreter
        application_path = os.path.dirname(os.path.realpath(__file__))

    if args.config is None:
        # From the base path get the path of the config file
        config_path = os.path.join(application_path, 'config.json')
    else:
        config_path = args.config

    # Load configuration data
    with open(config_path, 'r') as f:
        config = json.load(f)
    broker = config['broker']
    topics = config['topics']
    download_dir = config['download_directory']

    # Define extra information for the connection to the broker
    port = 443
    pwd = "everyone"
    uid = "everyone"
    protocol = "websockets"

    # Initialise MQTT client
    LOGGER.debug("Initialising client")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, transport=protocol)
    client.tls_set(ca_certs=None, certfile=None, keyfile=None,
                   cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLS,
                   ciphers=None)
    client.username_pw_set(uid, pwd)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_subscribe = on_subscribe
    LOGGER.debug("Connecting")
    result = client.connect(host=broker, port=port)
    LOGGER.debug(result)
    mqtt_thread = threading.Thread(
        target=client.loop_forever, daemon=True).start()

    # For the subscription, the client expects topic and download directory
    # pairs. So we need to create a new object with the correct format
    subs = {t: download_dir for t in topics}
    for sub in subs:
        client.subscribe(sub)

    # Create the app
    try:
        app = create_app(broker, subs, download_dir, client)
    except Exception as e:
        LOGGER.error("Error starting Flask app:", e)
    app.run(debug=True)


if __name__ == '__main__':
    main()
