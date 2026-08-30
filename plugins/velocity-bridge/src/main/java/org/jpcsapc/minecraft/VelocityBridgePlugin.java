package org.jpcsapc.minecraft;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.DisconnectEvent;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.event.player.ServerConnectedEvent;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;

@Plugin(id = "jpcsvelocitybridge", name = "JPCS Velocity Bridge", version = "1.0.0")
public final class VelocityBridgePlugin {
  private final ProxyServer proxy;
  private final Logger logger;
  private final Path dataDirectory;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  private final Map<UUID, Instant> joinedAt = new ConcurrentHashMap<>();
  private final Instant startedAt = Instant.now();
  private BridgeConfig config;

  @Inject
  public VelocityBridgePlugin(ProxyServer proxy, Logger logger, @DataDirectory Path dataDirectory) {
    this.proxy = proxy;
    this.logger = logger;
    this.dataDirectory = dataDirectory;
  }

  @Subscribe
  public void initialize(ProxyInitializeEvent event) {
    try { config = BridgeConfig.load(dataDirectory); } catch (IOException exception) { throw new IllegalStateException("Cannot load JPCS bridge config", exception); }
    for (String key : config.backends.keySet()) send("/server/start", "{\"serverKey\":\"" + key + "\",\"serverStartedAt\":\"" + startedAt + "\",\"version\":\"" + escape(proxy.getVersion().getVersion()) + "\"}");
    heartbeat();
    proxy.getScheduler().buildTask(this, this::heartbeat).repeat(Duration.ofSeconds(30)).schedule();
  }

  @Subscribe
  public void login(PostLoginEvent event) {
    Player player = event.getPlayer();
    Instant at = Instant.now();
    joinedAt.put(player.getUniqueId(), at);
    send("/players/join", "{\"uuid\":\"" + player.getUniqueId() + "\",\"username\":\"" + escape(player.getUsername()) + "\",\"joinedAt\":\"" + at + "\"}");
  }

  @Subscribe
  public void serverConnected(ServerConnectedEvent event) {
    String key = keyFor(event.getServer());
    if (key == null) return;
    Player player = event.getPlayer();
    send("/players/server", "{\"uuid\":\"" + player.getUniqueId() + "\",\"serverKey\":\"" + key + "\",\"connectedAt\":\"" + Instant.now() + "\"}");
  }

  @Subscribe
  public void disconnect(DisconnectEvent event) {
    Player player = event.getPlayer();
    Instant leftAt = Instant.now();
    long seconds = Duration.between(joinedAt.getOrDefault(player.getUniqueId(), leftAt), leftAt).toSeconds();
    joinedAt.remove(player.getUniqueId());
    send("/players/quit", "{\"uuid\":\"" + player.getUniqueId() + "\",\"username\":\"" + escape(player.getUsername()) + "\",\"leftAt\":\"" + leftAt + "\",\"sessionPlaytimeSeconds\":" + Math.max(0, seconds) + "}");
  }

  @Subscribe
  public void shutdown(ProxyShutdownEvent event) { for (String key : config.backends.keySet()) send("/server/stop", "{\"serverKey\":\"" + key + "\"}"); }

  private void heartbeat() {
    for (Map.Entry<String, String> entry : config.backends.entrySet()) {
      proxy.getServer(entry.getValue()).ifPresent(server -> sendHeartbeat(entry.getKey(), server));
    }
  }

  private void sendHeartbeat(String key, RegisteredServer server) {
    String players = server.getPlayersConnected().stream().map(player -> "\"" + player.getUniqueId() + "\"").reduce((a, b) -> a + "," + b).orElse("");
    int count = server.getPlayersConnected().size();
    server.ping().thenAccept(ping -> send("/heartbeat", "{\"serverKey\":\"" + key + "\",\"serverStartedAt\":\"" + startedAt + "\",\"version\":\"" + escape(ping.getVersion().getName()) + "\",\"playersOnline\":" + count + ",\"playersMax\":" + config.maxPlayers + ",\"onlinePlayerUuids\":[" + players + "]}"));
  }

  private String keyFor(RegisteredServer server) { return config.backends.entrySet().stream().filter(entry -> entry.getValue().equals(server.getServerInfo().getName())).map(Map.Entry::getKey).findFirst().orElse(null); }
  private void send(String path, String json) { HttpRequest request = HttpRequest.newBuilder(URI.create(config.apiUrl + "/v1/ingest" + path)).header("Authorization", "Bearer " + config.secret).header("Content-Type", "application/json").timeout(Duration.ofSeconds(15)).POST(HttpRequest.BodyPublishers.ofString(json)).build(); http.sendAsync(request, HttpResponse.BodyHandlers.discarding()).thenAccept(response -> { if (response.statusCode() >= 300) logger.warn("JPCS bridge {} returned {}", path, response.statusCode()); }).exceptionally(error -> { logger.warn("JPCS bridge {} failed: {}", path, error.getMessage()); return null; }); }
  private static String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
