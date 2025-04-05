FROM coturn/coturn:latest

# Copy configuration - Update paths to Windows style
COPY config\turnserver.conf C:\coturn\turnserver.conf

# Expose ports
EXPOSE 3478/tcp
EXPOSE 3478/udp
EXPOSE 49152-65535/udp

# Start the TURN server
ENTRYPOINT ["turnserver", "-c", "C:\\coturn\\turnserver.conf"]
