plugins {
  java
}

group = "org.jpcsapc.minecraft"
version = "1.0.5"

repositories {
  mavenCentral()
  maven("https://repo.papermc.io/repository/maven-public/")
  maven("https://repo.codemc.io/repository/maven-public/")
}

dependencies {
  compileOnly("com.velocitypowered:velocity-api:4.1.0-SNAPSHOT")
  annotationProcessor("com.velocitypowered:velocity-api:4.1.0-SNAPSHOT")
  compileOnly("net.skinsrestorer:skinsrestorer-api:15.12.4")
  testImplementation(platform("org.junit:junit-bom:5.13.4"))
  testImplementation("org.junit.jupiter:junit-jupiter")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

java {
  toolchain.languageVersion.set(JavaLanguageVersion.of(25))
}

tasks.jar {
  archiveBaseName.set("jpcs-velocity-bridge")
}

tasks.test {
  useJUnitPlatform()
}
