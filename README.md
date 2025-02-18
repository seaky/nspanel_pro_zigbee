# Sonoff NSPanel Pro ZStack repository
Sonoff NSPanel Pro device Zigbee gateway packages repository. 
NSPanel Pro Tools app's packageinstaller use this repository. 

## What is ZStack package?

To keep Zigbee chips as simple as possible, they typically only have a basic ZStack firmware installed, which allows communication via a serial protocol. This mode is called NCP (Network Co-Processor) mode. In such cases, a host device runs the application that implements the rest of the Zigbee stack, such as recognizing and managing end devices, among other functions. This application is sometimes referred to as ZGateway or ZStack Host, depending on the context.

In newer firmware versions, aside from obvious app improvements, the ZGateway or ZStack Host also tends to evolve. New Sonoff devices and possibly new features are added. For example, since firmware version 2.2.0, it has been possible to switch between Zigbee Coordinator and Router modes.

On Sonoff devices the Zigbee NCP firmware is EZSP 6.10.1.0 (EZSP v8)

The packages are extracted from the original firmware and converted to a portable format.

### How custom package deployer works

The installable packages will be placed in the release section of the **nspanel_pro_zigbee** repository. The packages are located in different branches, ensuring the source is open and accessible.

During installation, the script downloads the ZIP file, extracts it into the **app/cache** directory, and installs the primary part of the package into the `/vendor/bin/siliconlabs_host`  and ` /data/local/nspanel_tools_pkg/<package type>` directories after archiving the existing contents. Archiving only occurs if the `package_version` marker file is not present in the directory, which indicates that it does not contain a custom package.

#### Branch naming convension
Naming convension is ```<lowercase zstack type>_<zstack version>```

#### package_version file format
```<github tag>:<zstack type>-<zstack version>```

##### How to interpret

Example: z2m_v1.42.3:z2m-1.42
- z2m_v1.42.3: Type is z2m branch and the artifact version is 1.42.3. 
- z2m-1.42: Type is z2m and the ZStack version is 1.42

#### Package installer scripts

```pm.sh``` is responsible for installing the package. It is generalized but contains some custom package type related parts.

##### Parameters
- ```<install|uninstall>```
- ```<source path>```: source path where the package was unpacked
- ```<target path>```: destination or target path where the package will be installed
- ```-d <options>```: keep_data, keep_configuration additional options

The script can be reviewed in the relevant branch under the name `pm.sh`.

## Sonoff package
In this firmware version, you can change the Zigbee operation mode to router mode. I believe using it in Coordinator mode without the original application isn't practical because you can only connect Sonoff devices and cannot interact with them. If you want a more generic Coordinator, Zigbee2MQTT (z2m) is a better option.

Zigbee2MQTT version is Node.js-based and is now available as an installable package.

## Zigbee2MQTT package
Before installing, check if there’s enough space on the `/data` partition using a command like `df -h`. If you haven’t heavily modified the device, you should have around 1.9GB of free space.

The installer is designed to place only a few files on the `/vendor` partition, while the actual package is located under `/user/local/nspanel_tooks_pkg/<package type>`. This makes configuration changes straightforward.

In this version, z2m connects to the local Mosquitto broker. If you want it to connect to another broker, such as the Home Assistant broker, you can find the configuration file in z2m/config.

zigbee2mqtt frontend is available at: `http://<device ip>:8080/`

> [!CAUTION]
> Be aware that if z2m does not connect to the local broker, the application will not currently detect whether z2m is running and will not allow modifications. It will treat it as if it is not running. However, you can still reset or replace it if needed.

### Package configuration
Curently packages configurations are available in ```/data/local/nspanel_tools_pkg/<package>/config``` folder. UI is not support it yet.
