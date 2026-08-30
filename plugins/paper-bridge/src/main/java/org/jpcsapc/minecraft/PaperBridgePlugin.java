package org.jpcsapc.minecraft;

import com.destroystokyo.paper.profile.PlayerProfile;
import com.destroystokyo.paper.profile.ProfileProperty;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.plugin.java.JavaPlugin;

public final class PaperBridgePlugin extends JavaPlugin implements Listener {
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  private BridgeConfig config;

  @Override
  public void onEnable() {
    try {
      config = BridgeConfig.load(getDataFolder().toPath());
    } catch (IOException exception) {
      throw new IllegalStateException("Cannot load JPCS paper bridge config", exception);
    }
    getServer().getPluginManager().registerEvents(this, this);
  }

  @EventHandler
  public void onJoin(PlayerJoinEvent event) {
    getServer().getScheduler().runTaskLaterAsynchronously(this, () -> reportSkin(event.getPlayer()), 40L);
  }

  private void reportSkin(Player player) {
    if (!player.isOnline()) return;
    String hash = textureHash(player);
    if (hash == null) return;
    String json = "{\"uuid\":\"" + player.getUniqueId() + "\",\"skinTextureHash\":\"" + escape(hash) + "\"}";
    send("/players/skin", json);
  }

  static String textureHash(Player player) {
    PlayerProfile profile = player.getPlayerProfile();
    for (ProfileProperty property : profile.getProperties()) {
      if (!"textures".equals(property.getName())) continue;
      String decoded = new String(Base64.getDecoder().decode(property.getValue()), StandardCharsets.UTF_8);
      int marker = decoded.indexOf("\"url\":\"");
      if (marker < 0) continue;
      int start = marker + 7;
      int end = decoded.indexOf('"', start);
      if (end < 0) continue;
      String url = decoded.substring(start, end).replace("\\/", "/");
      int slash = url.lastIndexOf('/');
      if (slash < 0 || slash == url.length() - 1) continue;
      return url.substring(slash + 1);
    }
    return null;
  }

  private void send(String path, String json) {
    HttpRequest request = HttpRequest.newBuilder(URI.create(config.apiUrl + "/v1/ingest" + path))
      .header("Authorization", "Bearer " + config.secret)
      .header("Content-Type", "application/json")
      .timeout(Duration.ofSeconds(15))
      .POST(HttpRequest.BodyPublishers.ofString(json))
      .build();
    http.sendAsync(request, HttpResponse.BodyHandlers.discarding()).thenAccept(response -> {
      if (response.statusCode() >= 300) getLogger().warning("JPCS paper bridge " + path + " returned " + response.statusCode());
    }).exceptionally(error -> {
      getLogger().warning("JPCS paper bridge " + path + " failed: " + error.getMessage());
      return null;
    });
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
