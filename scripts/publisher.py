from awscrt import io, mqtt
from awsiot import mqtt_connection_builder
import json
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
    
ENDPOINT = "a2l8sui96z922q-ats.iot.us-east-2.amazonaws.com"
CLIENT_ID = "NFCSensor"
PATH_TO_CERTIFICATE = "certificate.pem.crt"
PATH_TO_PRIVATE_KEY = "private.pem.key"
PATH_TO_AMAZON_ROOT_CA_1 = "AmazonRootCA1.pem"
TOPIC = "nfc/request"

event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)
mqtt_connection = mqtt_connection_builder.mtls_from_path(
    endpoint=ENDPOINT,
    cert_filepath=PATH_TO_CERTIFICATE,
    pri_key_filepath=PATH_TO_PRIVATE_KEY,
    client_bootstrap=client_bootstrap,
    ca_filepath=PATH_TO_AMAZON_ROOT_CA_1,
    client_id=CLIENT_ID,
    clean_session=False,
    keep_alive_secs=6
)
connect_future = mqtt_connection.connect()
connect_future.result()
reader = SimpleMFRC522()
while True:
    try:
        id, text = reader.read()
        message = {"email": text}
        mqtt_connection.publish(topic=TOPIC, payload=json.dumps(message), qos=mqtt.QoS.AT_LEAST_ONCE)
    except Exception as ex:
        print(ex)
    finally:
        GPIO.cleanup()
        disconnect_future = mqtt_connection.disconnect()
        disconnect_future.result()
