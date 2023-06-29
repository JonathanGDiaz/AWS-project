from awscrt import io, mqtt
from awsiot import mqtt_connection_builder
from pyfirmata import Arduino
import time
import json

board = Arduino('/dev/ttyACM0')

def messageHandler(topic, payload, *args):
    data = json.loads(payload)
    print('Se recibió el mensaje: ')
    print(data)
    print('\n')
    print('En el topic: ')
    print(topic + '\n')
    if(data['door'] == 'open'):
        board.digital[13].write(1)
    else:
        board.digital[13].write(0)


ENDPOINT = "a2l8sui96z922q-ats.iot.us-east-2.amazonaws.com"
CLIENT_ID = "NFCSensor"
PATH_TO_CERTIFICATE = "certificate.pem.crt"
PATH_TO_PRIVATE_KEY = "private.pem.key"
PATH_TO_AMAZON_ROOT_CA_1 = "AmazonRootCA1.pem"
TOPIC = "nfc/response"

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

while True:
    suscrite_future, packet_id = mqtt_connection.subscribe(topic=TOPIC, qos=mqtt.QoS.AT_LEAST_ONCE, callback=messageHandler)
    suscrite_future.result()
    time.sleep(1)
