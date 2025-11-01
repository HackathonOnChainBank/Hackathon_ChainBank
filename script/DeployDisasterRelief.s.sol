// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DisasterRelief.sol";

contract DeployDisasterRelief is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署 DisasterRelief 合約
        DisasterRelief relief = new DisasterRelief();
        
        console.log("DisasterRelief deployed to:", address(relief));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        vm.stopBroadcast();
    }
}
