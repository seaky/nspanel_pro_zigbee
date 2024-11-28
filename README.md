### Zigbee Gateway package for NSPanel Pro device
NSPanel Pro ZGateway's latest binary. 

The binary can be installed manually, but it is primarily designed to be installed via the NSPanel Pro Tools application. This repository is used by the application to install the released packages available here.

The releases are created to match the firmware versions, where the first two digits in the version number correspond to the NSPanel Pro firmware version. For example, v3.5.0 matches the NSPanel Pro 3.5.0 firmware. The last digit indicates any changes made to the package. In this example, it represents the third version.

The Readme.txt file is the original manufacturer’s changelog. Which is not updated properly.

### Usage

Install NSPanel Pro Tools apk and on the Integration tab Zigbee section select custom gateway. 

### Manual usage

Copy downloaded package to the device. And from shell use the command below

#### Installation
```packagemanager.sh install /vendor/bin/siliconlabs_host <path where the package has been extracted>```

#### Restore original
```packagemanager.sh restore /vendor/bin/siliconlabs_host```


