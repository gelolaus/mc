package org.jpcsapc.minecraft;

import com.velocitypowered.api.proxy.Player;
import java.util.Optional;
import java.util.regex.Pattern;
import net.skinsrestorer.api.PropertyUtils;
import net.skinsrestorer.api.SkinsRestorer;
import net.skinsrestorer.api.property.SkinProperty;
import org.slf4j.Logger;

final class SkinReporter {
  private static final Pattern TEXTURE_HASH = Pattern.compile("^[a-f0-9]{64}$");

  private final SkinsRestorer skinsRestorer;
  private final Logger logger;

  SkinReporter(SkinsRestorer skinsRestorer, Logger logger) {
    this.skinsRestorer = skinsRestorer;
    this.logger = logger;
  }

  String textureHash(Player player) {
    if (skinsRestorer != null) {
      try {
        Optional<SkinProperty> skin = skinsRestorer.getPlayerStorage().getSkinOfPlayer(player.getUniqueId());
        if (skin.isPresent()) {
          String hash = PropertyUtils.getSkinTextureHash(skin.get());
          if (isTextureHash(hash)) return hash;
        }
        Optional<SkinProperty> resolved = skinsRestorer.getPlayerStorage().getSkinForPlayer(player.getUniqueId(), player.getUsername(), false);
        if (resolved.isPresent()) {
          String hash = PropertyUtils.getSkinTextureHash(resolved.get());
          if (isTextureHash(hash)) return hash;
        }
      } catch (Exception exception) {
        logger.warn("JPCS bridge: SkinRestorer lookup failed for {}: {}", player.getUsername(), exception.getMessage());
      }
    }
    return SkinTextures.textureHash(player.getGameProfile().getProperties());
  }

  private static boolean isTextureHash(String value) {
    return value != null && TEXTURE_HASH.matcher(value).matches();
  }
}
