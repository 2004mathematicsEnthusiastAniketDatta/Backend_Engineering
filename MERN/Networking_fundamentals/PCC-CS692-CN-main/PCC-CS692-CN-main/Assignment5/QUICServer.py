import asyncio
from aioquic.asyncio import serve
from aioquic.quic.configuration import QuicConfiguration
from aioquic.asyncio.protocol import QuicConnectionProtocol

class EchoQuicProtocol(QuicConnectionProtocol):
    """
    QUIC protocol handler that echoes received data back to the client.
    """
    async def stream_handler(self, stream_id, reader, writer):
        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break
                writer.write(data)
                await writer.drain()
        except Exception as e:
            print(f"Stream error: {e}")
        finally:
            writer.close()

class QUICServer:
    """
    QUIC Server class encapsulating server configuration and lifecycle.
    """
    def __init__(self, host="0.0.0.0", port=4433, certfile="ssl_cert.pem", keyfile="ssl_key.pem"):
        self.host = host
        self.port = port
        self.certfile = certfile
        self.keyfile = keyfile
        self.configuration = self._create_configuration()

    def _create_configuration(self):
        config = QuicConfiguration(
            is_client=False,
            alpn_protocols=["hq-29"]
        )
        config.load_cert_chain(self.certfile, self.keyfile)
        return config

    async def _run(self):
        print(f"Starting QUIC server on {self.host}:{self.port}")
        await serve(
            self.host,
            self.port,
            configuration=self.configuration,
            create_protocol=EchoQuicProtocol,
        )

    def start(self):
        """
        Start the QUIC server and run indefinitely.
        """
        try:
            asyncio.run(self._run())
        except KeyboardInterrupt:
            print("Server stopped manually.")
        except Exception as e:
            print(f"Server error: {e}")

if __name__ == "__main__":
    server = QUICServer()
    server.start()
