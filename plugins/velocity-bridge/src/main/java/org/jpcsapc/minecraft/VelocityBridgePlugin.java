package org.jpcsapc.minecraft;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.connection.DisconnectEvent;
import com.velocitypowered.api.event.connection.PostLoginEvent;
import com.velocitypowered.api.event.player.ServerConnectedEvent;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Dependency;
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
import java.util.Set;
import com.velocitypowered.api.plugin.Plugin;
import net.skinsrestorer.api.SkinsRestorer;
import net.skinsrestorer.api.SkinsRestorerProvider;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;

@Plugin(id = "jpcsvelocitybridge", name = "JPCS Velocity Bridge", version = "1.0.4", dependencies = {@Dependency(id = "skinsrestorer", optional = true)})
public final class VelocityBridgePlugin {
  private final ProxyServer proxy;
  private final Logger logger;
  private final Path dataDirectory;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  private final Map<UUID, Instant> joinedAt = new ConcurrentHashMap<>();
  private final Set<UUID> backendSessions = ConcurrentHashMap.newKeySet();
  private final Instant startedAt = Instant.now();
  private BridgeConfig config;
  private SkinReporter skinReporter;

  @Inject
  public VelocityBridgePlugin(ProxyServer proxy, Logger logger, @DataDirectory Path dataDirectory) {
    this.proxy = proxy;
    this.logger = logger;
    this.dataDirectory = dataDirectory;
  }

  @Subscribe
  public void initialize(ProxyInitializeEvent event) {
    try { config = BridgeConfig.load(dataDirectory); } catch (IOException exception) { throw new IllegalStateException("Cannot load JPCS bridge config", exception); }
    SkinsRestorer skinsRestorer = null;
    try {
      skinsRestorer = SkinsRestorerProvider.get();
      logger.info("JPCS bridge: using SkinRestorer for skin reporting");
    } catch (Exception exception) {
      logger.warn("JPCS bridge: SkinRestorer unavailable, using GameProfile fallback only");
    }
    skinReporter = new SkinReporter(skinsRestorer, logger);
    for (String key : config.backends.keySet()) send("/server/start", "{\"serverKey\":\"" + key + "\",\"serverStartedAt\":\"" + startedAt + "\",\"version\":\"" + escape(proxy.getVersion().getVersion()) + "\"}");
    heartbeat();
    proxy.getScheduler().buildTask(this, this::heartbeat).repeat(Duration.ofSeconds(30)).schedule();
  }

  @Subscribe
  public void login(PostLoginEvent event) {
    Player player = event.getPlayer();
    joinedAt.put(player.getUniqueId(), Instant.now());
  }

  private void scheduleSkinReport(Player player) {
    UUID uuid = player.getUniqueId();
    proxy.getScheduler().buildTask(this, () -> proxy.getPlayer(uuid).ifPresent(this::reportSkin)).delay(Duration.ofSeconds(5)).schedule();
  }

  @Subscribe
  public void serverConnected(ServerConnectedEvent event) {
    String key = keyFor(event.getServer());
    if (key == null) return;
    Player player = event.getPlayer();
    Instant connectedAt = Instant.now();
    if (backendSessions.add(player.getUniqueId())) {
      send("/players/join", "{\"uuid\":\"" + player.getUniqueId() + "\",\"username\":\"" + escape(player.getUsername()) + "\",\"joinedAt\":\"" + connectedAt + "\",\"serverKey\":\"" + key + "\"}");
    } else {
      send("/players/server", "{\"uuid\":\"" + player.getUniqueId() + "\",\"username\":\"" + escape(player.getUsername()) + "\",\"serverKey\":\"" + key + "\",\"connectedAt\":\"" + connectedAt + "\"}");
    }
    scheduleSkinReport(player);
  }

  private void reportSkin(Player player) {
    String hash = skinReporter.textureHash(player);
    if (hash == null) {
      logger.warn("JPCS bridge: no skin texture for {}", player.getUsername());
      return;
    }
    logger.info("JPCS bridge: reporting skin for {} ({})", player.getUsername(), hash.substring(0, 8) + "...");
    send("/players/skin", "{\"uuid\":\"" + player.getUniqueId() + "\",\"skinTextureHash\":\"" + escape(hash) + "\"}");
  }

  @Subscribe
  public void disconnect(DisconnectEvent event) {
    Player player = event.getPlayer();
    Instant leftAt = Instant.now();
    long seconds = Duration.between(joinedAt.getOrDefault(player.getUniqueId(), leftAt), leftAt).toSeconds();
    joinedAt.remove(player.getUniqueId());
    if (!backendSessions.remove(player.getUniqueId())) return;
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
    String players = server.getPlayersConnected().stream().map(player -> {
      backendSessions.add(player.getUniqueId());
      return "{\"uuid\":\"" + player.getUniqueId() + "\",\"username\":\"" + escape(player.getUsername()) + "\"}";
    }).reduce((a, b) -> a + "," + b).orElse("");
    int count = server.getPlayersConnected().size();
    server.ping().thenAccept(ping -> send("/heartbeat", "{\"serverKey\":\"" + key + "\",\"serverStartedAt\":\"" + startedAt + "\",\"version\":\"" + escape(ping.getVersion().getName()) + "\",\"playersOnline\":" + count + ",\"playersMax\":" + config.maxPlayers + ",\"onlinePlayers\":[" + players + "]}"));
  }

  private String keyFor(RegisteredServer server) { return config.backends.entrySet().stream().filter(entry -> entry.getValue().equals(server.getServerInfo().getName())).map(Map.Entry::getKey).findFirst().orElse(null); }
  private void send(String path, String json) { HttpRequest request = HttpRequest.newBuilder(URI.create(config.apiUrl + "/v1/ingest" + path)).header("Authorization", "Bearer " + config.secret).header("Content-Type", "application/json").timeout(Duration.ofSeconds(15)).POST(HttpRequest.BodyPublishers.ofString(json)).build(); http.sendAsync(request, HttpResponse.BodyHandlers.discarding()).thenAccept(response -> { if (response.statusCode() >= 300) logger.warn("JPCS bridge {} returned {}", path, response.statusCode()); }).exceptionally(error -> { logger.warn("JPCS bridge {} failed: {}", path, error.getMessage()); return null; }); }
  private static String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
