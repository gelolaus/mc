package org.jpcsapc.minecraft;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Properties;

final class BridgeConfig {
  final String apiUrl;
  final String secret;

  private BridgeConfig(String apiUrl, String secret) {
    this.apiUrl = apiUrl.replaceAll("/$", "");
    this.secret = secret;
  }

  static BridgeConfig load(Path dataDirectory) throws IOException {
    Files.createDirectories(dataDirectory);
    Path file = dataDirectory.resolve("config.properties");
    if (Files.notExists(file)) {
      Files.writeString(file, "api-url=https://api.mc.jpcs-apc.org\ningest-secret=replace-me\n");
    }
    Properties properties = new Properties();
    try (var input = Files.newInputStream(file)) {
      properties.load(input);
    }
    String secret = properties.getProperty("ingest-secret", "");
    if (secret.equals("replace-me") || secret.isBlank()) {
      throw new IllegalStateException("Set ingest-secret in " + file);
    }
    return new BridgeConfig(properties.getProperty("api-url", ""), secret);
  }
}
