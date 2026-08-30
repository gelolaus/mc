package org.jpcsapc.minecraft;

import com.velocitypowered.api.util.GameProfile;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

final class SkinTextures {
  private SkinTextures() {}

  static String textureHash(Iterable<GameProfile.Property> properties) {
    for (GameProfile.Property property : properties) {
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
}
