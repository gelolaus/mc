package org.jpcsapc.minecraft;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

final class BridgeConfig {
  final String apiUrl;
  final String secret;
  final int maxPlayers;
  final Map<String, String> backends;
  private BridgeConfig(String apiUrl, String secret, int maxPlayers, Map<String, String> backends) { this.apiUrl = apiUrl.replaceAll("/$", ""); this.secret = secret; this.maxPlayers = maxPlayers; this.backends = backends; }
  static BridgeConfig load(Path dataDirectory) throws IOException {
    Files.createDirectories(dataDirectory);
    Path file = dataDirectory.resolve("config.properties");
    if (Files.notExists(file)) Files.writeString(file, "api-url=https://api.mc.jpcs-apc.org\ningest-secret=replace-me\nmax-players=100\nsurvival-server=survival\ncreative-server=creative\n");
    Properties properties = new Properties(); try (var input = Files.newInputStream(file)) { properties.load(input); }
    String secret = properties.getProperty("ingest-secret", ""); if (secret.equals("replace-me") || secret.isBlank()) throw new IllegalStateException("Set ingest-secret in " + file);
    Map<String, String> backends = new LinkedHashMap<>(); backends.put("survival", properties.getProperty("survival-server", "survival")); backends.put("creative", properties.getProperty("creative-server", "creative"));
    return new BridgeConfig(properties.getProperty("api-url", ""), secret, Integer.parseInt(properties.getProperty("max-players", "100")), backends);
  }
}
