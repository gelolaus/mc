package org.jpcsapc.minecraft;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

final class BridgeConfigTest {
  @TempDir Path directory;

  @Test
  void defaultsToLobbySurvivalAndCreativeBackends() throws Exception {
    Files.writeString(directory.resolve("config.properties"), """
        api-url=https://api.mc.jpcs-apc.org
        ingest-secret=test-secret
        max-players=60
        """);

    BridgeConfig config = BridgeConfig.load(directory);

    assertEquals(List.of("lobby", "survival", "creative"), List.copyOf(config.backends.keySet()));
    assertEquals("lobby", config.backends.get("lobby"));
  }

  @Test
  void generatedConfigurationDocumentsTheLobbyBackend() throws Exception {
    try {
      BridgeConfig.load(directory);
    } catch (IllegalStateException expected) {
      assertTrue(expected.getMessage().contains("ingest-secret"));
    }

    assertTrue(Files.readString(directory.resolve("config.properties")).contains("lobby-server=lobby"));
  }
}
